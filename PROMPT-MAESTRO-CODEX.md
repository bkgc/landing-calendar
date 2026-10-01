## ROL

Eres un Senior Full Stack Engineer experto en Next.js 16, Firebase, TailwindCSS, HeroUI 2.8 y Google Calendar API. Vas a construir un SaaS multi-tenant completo, escalable y con código limpio.

## NOMBRE DEL PROYECTO: AgendaPro

### STACK OBLIGATORIO

- **Frontend:** Next.js 16 (App Router, TypeScript, Server Actions)
- **UI:** TailwindCSS + HeroUI 2.8 (USA EXCLUSIVAMENTE COMPONENTES DE HEROUI, no uses shadcn ni otros)
- **Backend & DB:** Firebase (Authentication, Firestore, Storage, Cloud Functions v2, Firebase Cloud Messaging)
- **Pagos:** Pasarela Libélula (para suscripciones recurrentes)
- **Calendario:** Google Calendar API (OAuth 2.0, FreeBusy, Events)
- **Notificaciones:** Web Push API + Firebase Cloud Messaging (FCM) estilo Netflix/YouTube, + Email con Resend
- **Estado:** Zustand
- **Drag & Drop:** dnd-kit
- **Validación:** Zod + React Hook Form

### CONCEPTO DEL PRODUCTO

Un SaaS para que cualquier negocio de servicios (uñas, barbería, dentista, spa, consultorios) tenga:

1.  Su propia landing page 100% personalizable tipo rompecabezas (Notion-like)
2.  Sistema de agendamiento conectado a Google Calendar (fuente de verdad)
3.  Gestión de citas, servicios, staff y clientes.

El sistema tiene 2 Apps en 1 codebase:

**A) PLATAFORMA PRINCIPAL (app.agendapro.com -> /dashboard)**
Donde el dueño del negocio (Owner) se registra, paga y administra todo.

**B) LANDING PÚBLICA DE CADA NEGOCIO (agendapro.com/[slug])**
Landing pública que renderiza el JSON del builder. Aquí es donde el cliente final agenda.

### ROLES

1.  **Super Admin (Tú):** Dashboard interno para ver MRR, negocios, logs de Libélula.
2.  **Owner:** CRUD de negocio, landing, servicios, staff, disponibilidad, citas. Conecta su Google Calendar.
3.  **Cliente Final (sin cuenta):** Solo agenda. Pone nombre, WhatsApp, email y reserva.

### FUNCIONALIDADES COMPLETAS (ALCANCE)

#### MÓDULO 1: AUTENTICACIÓN Y MULTI-TENANT

- Registro/Login con Firebase Auth (Email/Password + Google)
- Al registrarse, se crea `businesses/{businessId}` con `slug` único (validar disponibilidad tipo vercel.com/slug)
- Onboarding de 3 pasos: Nombre del negocio, categoría, conectar Google Calendar.
- Middleware de Next.js que protege /dashboard y verifica `subscriptionStatus`

#### MÓDULO 2: PAGE BUILDER - TIPO ROMPECABEZAS (CORE)

Este es el diferenciador. NO son plantillas cerradas.

**Lógica de datos:**
Guardado en `businesses/{businessId}/landingConfig` como:

```json
{
  "theme": { "primary": "#FF2D78", "background": "#FFFFFF", "foreground": "#111", "font": "Outfit", "radius": "lg" },
  "blocks": [
    { "id": "uuid1", "type": "navbar", "props": {...} },
    { "id": "uuid2", "type": "hero", "props": {"title": "...", "subtitle": "...", "ctaText": "Reservar ahora", "imageUrl": "firebaseStorageUrl"} }
  ]
}
```

**Bloques Obligatorios a construir (todos con HeroUI):**

- `navbar`: logo, links, CTA, sticky. No se puede eliminar.
- `hero`: Título, subtítulo, CTA, imagen/video de fondo.
- `services`: Lista automática de `businesses/{id}/services`. Muestra Card, duración, precio.
- `booking_calendar`: EL MÁS IMPORTANTE. Renderiza calendario real que consulta disponibilidad a Google Calendar via Cloud Function `getAvailableSlots`.
- `gallery`: Uploader a Firebase Storage, grid de 2/3/4 columnas, lightbox.
- `video_embed`: Input de URL. Si detecta tiktok.com -> renderiza `<blockquote class="tiktok-embed">` o iframe `https://www.tiktok.com/embed/ID`. Si es instagram.com/reel -> embed. Si es youtube shorts -> embed.
- `staff`: Lista de `businesses/{id}/staff`
- `testimonials`: Carrusel HeroUI con {quote, name, avatar, stars}
- `text_image`: Bloque libre (título + texto + imagen izq/der)
- `faq`: Acordeón HeroUI
- `map_contact`: Google Maps iframe + botones WhatsApp/Instagram
- `footer`

**Editor en `/dashboard/editor`:**

- Panel Izquierdo (70%): Lienzo con `BlockRenderer`. Usa `dnd-kit` sortable para reordenar. Hover muestra controles: Editar, Duplicar, Eliminar.
- Panel Derecho (30%): `PropertiesPanel`. Si seleccionas un bloque, muestra sus props editables (Inputs de HeroUI). Si no hay selección, muestra editor de `theme` global (Color pickers para primary/background, Select para font, Slider para radius).
- Todo cambio hace debounce de 800ms y guarda en Firestore. Las imágenes se suben a `businesses/{businessId}/media/` en Firebase Storage.

#### MÓDULO 3: GESTIÓN DE NEGOCIO

- **Servicios:** CRUD en `businesses/{id}/services/{serviceId}` -> {name, description, duration (min), price, bufferTime (min), staffIds[], active}
- **Staff:** CRUD en `businesses/{id}/staff/{staffId}` -> {name, avatar, role, email, googleCalendarId, services[]}
- **Disponibilidad:** Ya no es un CRUD manual. Se lee de Google Calendar. Pero necesitas un fallback: `businesses/{id}/settings/businessHours` {monday: {open: "09:00", close: "18:00", enabled: true}}

#### MÓDULO 4: GOOGLE CALENDAR - MOTOR DE DISPONIBILIDAD

1.  **OAuth 2.0:** Rutas `/api/auth/google` y `/api/auth/google/callback`. Scopes: `calendar.events` y `calendar.readonly`. Guardar tokens ENCRIPTADOS en `businesses/{id}/integrations/google`.
2.  **Helper:** `lib/google/getClient(businessId)` que obtiene el token, lo refresca si expiró y retorna `calendar` client de `googleapis`.
3.  **Cloud Function `getAvailableSlots`:**
    - Input: {businessId, staffId, date (YYYY-MM-DD), serviceDuration}
    - Proceso: Llama a `calendar.freebusy.query` con timeMin y timeMax de ese día + businessHours. Obtiene array `busy`. Genera slots cada 15 min dentro de businessHours, y filtra los que colisionan con `busy` y con `bufferTime`.
    - Output: ["09:00", "09:30", "11:00"]
4.  **Crear Cita:** Al confirmar, `calendar.events.insert()` en el `calendarId` del staff. Guardar `googleEventId` en Firestore. El evento debe tener `summary`, `description`, `start`, `end`, `attendees`, `reminders`.

#### MÓDULO 5: SISTEMA DE CITAS

- Colección `businesses/{id}/appointments/{appointmentId}` -> {serviceId, staffId, clientName, clientPhone, clientEmail, start (Timestamp), end (Timestamp), googleEventId, status: "confirmed" | "cancelled" | "completed" | "no_show", createdAt}
- Dashboard en `/dashboard/appointments`: Vista tabla + calendario (HeroUI Calendar). Acciones: Cancelar (borra evento de Google), Reprogramar, Marcar como completada.
- Lógica anti-doble-reserva: Transacción de Firestore + verificación de freebusy antes de crear.

#### MÓDULO 6: NOTIFICACIONES ESTILO NETFLIX / GOOGLE

**Requerimiento: Notificación Push Web como Netflix/YouTube cuando se agenda una cita.**

1.  **Web Push para el Owner:**
    - Usa Firebase Cloud Messaging (FCM).
    - En `/dashboard/settings/notifications` botón "Activar notificaciones".
    - Pide permiso de notificación del navegador `Notification.requestPermission()`.
    - Guarda el FCM token en `users/{userId}/fcmTokens[]`
    - Cloud Function `onAppointmentCreated`: Cuando se crea una cita, envía push a todos los tokens del owner: Título: "¡Nueva cita! - Maria agendó Manicure", Body: "Hoy 14:00", Icon: logo, Click_action: /dashboard/appointments.
    - En el Navbar del dashboard, un icono de campana (HeroUI Badge) con contador de no leídas, dropdown con últimas citas (estilo Netflix).

2.  **Notificación para Cliente Final:**
    - Email de confirmación con Resend.
    - (Opcional) WhatsApp con Twilio/WhatAPI.

#### MÓDULO 7: PAGOS Y SUSCRIPCIONES - LIBÉLULA

- Colección `plans` -> {id: "pro", name: "Pro", price: 29, currency: "BOB", features: {maxStaff: 3, maxServices: 20, removeBranding: true, customDomain: false}}
- En `/dashboard/billing`, mostrar planes y botón "Suscribirse".
- Al dar click, llamar a tu backend `/api/libelula/create-subscription` que crea la suscripción en Libélula y retorna `payment_url`. Redirigir al usuario.
- Webhook `/api/webhooks/libelula`: Valida firma, actualiza `businesses/{id}` -> {subscriptionStatus: "active", plan: "pro", libelulaSubscriptionId, currentPeriodEnd}
- Middleware que bloquea funciones si `subscriptionStatus != active` y el negocio tiene más de X citas (free trial de 7 días).

#### MÓDULO 8: CONFIGURACIÓN Y SEO

- Settings: Nombre, slug, logo, favicon, SEO title/description, WhatsApp, Instagram, Pixel de Facebook.
- La landing pública `[slug]` debe tener `generateMetadata` dinámico con datos del negocio.

### LÍMITES Y LO QUE NO SE HACE (NEGATIVE SCOPE)

- NO se hace app móvil nativa. Solo web responsive.
- NO se hace sistema de cobro al cliente final por la cita (solo suscripción del Owner a la plataforma vía Libélula). No integrar Stripe para cobrar la cita.
- NO se hace chat en vivo interno.
- NO se hace facturación. Solo suscripción.
- NO se hace multi-idioma en MVP. Solo español.
- NO se permite HTML custom en el builder (seguridad).
- NO se usa Google Calendar como login, solo como integración conectable/desconectable.
- Límite Free: 1 staff, 5 servicios, 30 citas/mes, con branding "Hecho con AgendaPro".
- Límite Pro: 5 staff, servicios ilimitados, sin branding, notificaciones push.

### ESTRUCTURA DE CARPETAS OBLIGATORIA

Sigue ESTRICTAMENTE el archivo DEVELOPMENT-GUIDELINES.md que te proporciono.

### ENTREGABLES EN ORDEN

1.  Setup inicial Next.js + Firebase + HeroUI + Tailwind + Estructura de carpetas.
2.  Autenticación + Creación de Business + Onboarding.
3.  Integración Google Calendar OAuth + getClient + getAvailableSlots.
4.  Page Builder (BlockRenderer + dnd-kit + PropertiesPanel + Theme).
5.  Módulo Servicios/Staff/Appointments.
6.  Landing pública [slug] + SEO.
7.  Notificaciones Push tipo Netflix (FCM + campana).
8.  Integración Libélula (checkout + webhook).

¡Empieza por el punto 1 y 2!

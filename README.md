# AgendaPro — SaaS de Agendamiento y Landing Pages para Bolivia

AgendaPro es una plataforma SaaS multi-tenant diseñada para negocios de servicios (centros de estética, salones de belleza, consultorios médicos, spas, asesorías y profesionales independientes). Permite a los negocios crear su propia **landing page interactiva 100% personalizable** (estilo Notion / Canvas por bloques), gestionar sus **citas sincronizadas con Google Calendar**, administrar su **equipo y catálogo de servicios**, y cobrar suscripciones locales mediante **QR Simple / Libélula (Todotix)**.

---

## 🛠️ Stack Tecnológico

- **Frontend:** Next.js 16 (App Router, Server Components y Server Actions) con TypeScript estricto.
- **Componentes UI:** [HeroUI 2.8](https://heroui.com/) y Tailwind CSS 4.
- **Backend & Base de Datos:** Firebase (Authentication con cookie de sesión HttpOnly, Firestore Database, Firebase Storage, Firebase Admin SDK y Firebase Cloud Messaging).
- **Calendario & Sincronización:** Google Calendar API v3 (OAuth 2.0 seguro firmado con HMAC-SHA256, cálculo de FreeBusy y creación de eventos).
- **Pasarela de Pagos (Bolivia):** Libélula / Todotix (API de recaudación de deudas mediante QR Simple interoperable para bancos BNB, BCP, Banco Unión, BMSC, Mercantil Santa Cruz, Banco Ganadero, etc.).
- **Gestor de Estado y Formularios:** Zustand, React Hook Form, Zod y `@dnd-kit` para arrastrar y soltar bloques.
- **Testing & Calidad:** Vitest para pruebas unitarias y TypeScript Strict (`tsc --noEmit`).

---

## 📦 Lo que el Sistema YA Tiene Implementado

### 1. Autenticación, Seguridad y Multi-Tenant
- **Autenticación con Firebase Auth:** Registro y login con Email/Password y Google Sign-In.
- **Sesión Server-Side Robusta:** Cookie `__session` HttpOnly (5 días de validez) verificada en el servidor con Firebase Admin.
- **Multi-Tenant con Slug Único:** Validación en tiempo real de disponibilidad de slug (`agendapro.com/[slug]`).
- **Onboarding Guiado:** Flujo de configuración inicial en 3 pasos (Nombre, Categoría del negocio, Conexión a Google Calendar).
- **Middleware y Guards:** Redirección automática de usuarios no autenticados o que no completaron su onboarding.

### 2. Editor de Landing ("Page Builder" Rompecabezas)
- **18+ Tipos de Bloques:**
  - `navbar`: Cabecera fija o flotante con logo y botón CTA.
  - `hero`: Título, subtítulo, llamada a la acción e imagen/video de fondo.
  - `services`: Muestra automática del catálogo activo con precios en BOB y duraciones.
  - `booking_calendar`: Calendario de reservas en vivo que consulta disponibilidad real.
  - `gallery`: Cuadrícula responsiva de imágenes con visor ampliado.
  - `image_carousel`: Carrusel interactivo de imágenes.
  - `video_embed`: Reproductor de YouTube, TikTok o Instagram Reels.
  - `staff`: Presentación del equipo de trabajo.
  - `testimonials`: Reseñas de clientes con puntuación de estrellas y avatar.
  - `faq`: Acordeón de preguntas frecuentes.
  - `features`: Cuadrícula de beneficios y ventajas competitivas.
  - `stats`: Cifras y métricas clave del negocio.
  - `call_to_action`: Bloques de conversión con fondo destacado.
  - `map_contact`: Ubicación con mapa y enlaces a WhatsApp y redes sociales.
  - `footer`: Enlaces, copyright y aviso legal.
- **Biblioteca de Plantillas Predefinidas:**
  - 💈 **Barbería & Salón Masculino:** Estilo oscuro y dorado (`#c29b38`), cortes de autor, catálogo y mapa.
  - 🩺 **Consultorio Médico o Dental:** Estilo clínico y pulcro (`#0284c7`), especialidades, tecnología y preguntas frecuentes.
  - 💅 **Spa & Centro de Estética:** Estilo zen y elegante (`#d946ef`), masajes, testimonios y carrusel visual.
  - ⚖️ **Consultoría & Asesoría:** Estilo corporativo esmeralda (`#11766f`), métricas de impacto y asesoría.
- **Control de Estilos y Fondos Avanzados:**
  - Fondos sólidos con paletas predefinidas.
  - Degradados lineales con presets modernos (Esmeralda, Océano, Sunset, etc.).
  - Imágenes de fondo con selector de opacidad (overlay 0% - 95%) para garantizar legibilidad.
- **Compresión de Imágenes en el Navegador:**
  - Módulo `lib/utils/image-compression.ts` que comprime fotos de alta resolución en el cliente mediante Canvas API antes de subirlas a Firebase Storage.
- **Animaciones Configurables:**
  - Animaciones de entrada: `fade_in`, `slide_up`, `zoom_in`, `bounce_in`, `flip_in`.
  - Animaciones en bucle: `float`, `pulse`, `shimmer`, `glow`.
- **Experiencia de Edición (UX):**
  - Historial **Deshacer / Rehacer (Undo / Redo)**.
  - Previsualizador responsive con marcos de **Escritorio, Tablet y Celular**.
  - Indicador de estado de guardado en vivo (`Guardado`, `Guardando`, `Error al guardar`, `Cambios pendientes`).

### 3. Landing Pública del Negocio (`/[slug]`)
- **Diseño Personalizado:** Variables CSS inyectadas dinámicamente (`--landing-primary`, `--landing-background`, fuentes y radios).
- **SEO Dinámico:** Generación de etiquetas `title`, `description` y `favicon` por negocio.
- **Píxel de Facebook:** Inyección sanitizada y segura del script de Meta Pixel configurado en Ajustes.
- **Monetización y Branding:**
  - Insignia *"⚡ Hecho con AgendaPro · Crea tu agenda gratis"* en el Plan Free.
  - Ocultamiento automático de la insignia para clientes con Plan Pro activo.
- **Rendimiento:** Regeneración estática incremental (`revalidate = 60`) para máxima velocidad.

### 4. Integración con Google Calendar (OAuth 2.0)
- **Firma Criptográfica HMAC-SHA256:** Parámetro `state` firmado para evitar pérdida de cookies en redirecciones cross-origin HTTPS → HTTP en entornos de desarrollo y producción.
- **Cifrado AES-256-GCM:** Tokens OAuth almacenados cifrados en Firestore.
- **Preservación de Refresh Token:** Mantiene tokens previos si Google omite el envío del consent en reconexiones.
- **Disponibilidad en Tiempo Real (`getAvailableSlots`):** Consulta FreeBusy de Google Calendar respetando el horario comercial y bloqueando franjas pasadas.

### 5. Pagos y Suscripciones para Bolivia (Libélula / Todotix)
- **API Real de Todotix:** Conexión con `https://api.todotix.com/rest/deuda/registrar` usando `APPKEY_LIBELULA`.
- **Generación de QR Simple:** Soporta pagos desde BNB, BCP, Banco Unión, BMSC, Mercantil, Ganadero, etc.
- **Modal Interactivo de Cobro:** Muestra código QR dinámico y botón para pagar con tarjeta de crédito/débito.
- **Polling en Tiempo Real:** Comprobación automática cada 4 segundos (`/api/libelula/check-payment`). Al confirmar la acreditación, activa automáticamente el Plan Pro por 30 días en Firestore.

### 6. Catálogo de Servicios & Gestión de Personal
- **Catálogo de Servicios:** Creación, edición en línea, pausa temporal y modal de confirmación antes de eliminar. Precios en BOB y duraciones en minutos.
- **Gestión de Personal (Staff):** Creación, edición completa, asignación visual de servicios con chips, conmutador de pausa/activación y modal de confirmación de eliminación.

### 7. Agenda de Citas (`/dashboard/appointments`)
- **Registro Manual de Citas:** Permite al administrador ingresar citas telefónicas o presenciales con validación de horarios libres en tiempo real.
- **Reprogramación Inteligente:** Modal con selector de fecha y franjas horarias disponibles que actualiza tanto Firestore como Google Calendar sin riesgo de colisiones.
- **Filtros por Estado en Tiempo Real:** Visualización rápida de Todas, Confirmadas, Completadas o Canceladas con contadores dinámicos.
- **Confirmación de Cancelación:** Modal protector antes de cancelar una reserva y liberar el cupo.

---

## 💻 Configuración Local

```bash
# 1. Clonar repositorio e instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local

# 3. Iniciar servidor de desarrollo
npm run dev
```

En producción, configura `GOOGLE_TOKEN_ENCRYPTION_KEY` con una clave aleatoria
de 32 bytes codificada en 64 caracteres hexadecimales, además de
`LIBELULA_WEBHOOK_SECRET` y la clave API de Libélula. Los webhooks se rechazan
si la firma HMAC no es válida. Si rotas la clave de cifrado, conserva
temporalmente la anterior en `GOOGLE_TOKEN_ENCRYPTION_KEY_LEGACY`; los tokens se
vuelven a cifrar al renovarse. Retira la clave anterior cuando todos los tokens
se hayan migrado o se hayan vuelto a conectar las cuentas.

El limitador distribuido escribe contadores en la colección `rateLimits`, con
el campo `expiresAt`. Configura una política TTL de Cloud Firestore en ese
campo para eliminar automáticamente los contadores vencidos.

### Verificación de Calidad

```bash
# Ejecutar suite de pruebas unitarias
npm test

# Verificación de tipos TypeScript
npx tsc --noEmit

# Compilación de producción
npm run build
```

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

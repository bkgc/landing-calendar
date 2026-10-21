# 📋 Informe de Auditoría Integral: AgendaPro (landing-calendar)

**Fecha:** 18 de Octubre, 2026  
**Stack tecnológico:** Next.js 16 (App Router), React 19, TypeScript 5.9, HeroUI 2.8, Tailwind CSS v4, Firebase (Auth + Firestore + Storage + FCM), Google Calendar API v3 (OAuth 2.0), Libélula / Todotix (Pagos QR Bolivia), Vitest.  
**Estado de Verificación Técnica:**
- 🟢 **TypeScript:** `npx tsc --noEmit` completado con 0 errores.
- 🟢 **Tests Automatizados:** 20/20 tests pasaron con éxito (Vitest).
- 🟢 **Build de producción:** `npm run build` completado correctamente.
- 🟢 **Lint:** sin errores; el proyecto aún reporta advertencias acumuladas que deben tratarse gradualmente.

---

## 📑 Resumen Ejecutivo

AgendaPro es una plataforma SaaS multi-tenant diseñada para negocios en Bolivia que combina un creador visual de páginas de aterrizaje con un motor de reservas y sincronización bidireccional con Google Calendar y pagos QR vía Libélula.

Tras una revisión profunda de la arquitectura, rutas API, componentes del Dashboard, motor del Builder y la Landing pública, se evidencia un sistema con bases sólidas y una gran cantidad de funcionalidades operativas, pero con puntos de fricción críticos en la experiencia del usuario final que deben ser atendidos con prioridad (especialmente la selección de servicios/fechas en reservas y la interfaz de degradados).

---

## 1. 🟢 Lo que está Implementado y Funcionando

### A. Arquitectura y Seguridad
- **Autenticación completa:** Flujo con Firebase Auth (`email/password` y Google), con guardias tanto en cliente (`AuthGuard.tsx`) como en servidor (`requireServerSession()`, `requireEntitledSession()`).
- **Control de límites y planes:** Validación en servidor de los límites del plan Free (hasta 30 citas/mes, 1 staff, 5 servicios) y validación de suscripción activa o en periodo de prueba (`trialing`).
- **Protección contra ataques:** Rate limiting compartido por Firestore en endpoints clave, verificación HMAC obligatoria para webhooks de Libélula y estado firmado para OAuth de Google.
- **Transacciones atómicas:** Bloqueo de concurrencia (`appointmentLocks`) en Firestore mediante `runTransaction` para evitar dobles reservas simultáneas del mismo horario y profesional.

### B. Landing Builder (Editor Visual)
- **18 Bloques modulares:** `navbar`, `hero`, `services`, `booking_calendar`, `gallery`, `video_embed`, `staff`, `testimonials`, `text_image`, `faq`, `map_contact`, `footer`, `container`, `image_carousel`, `features`, `stats`, `call_to_action`.
- **Personalización universal de secciones:**
  - Alineación de contenido (`left`, `center`, `right`).
  - Relleno vertical regulable (`none`, `sm`, `md`, `lg`, `xl`).
  - Fondos configurables: Color sólido, Degradados con presets, e Imagen de fondo con control de opacidad oscura para contraste de texto.
  - Sistema de 16 animaciones CSS (7 de entrada, 3 de salida y 6 en bucle: flotación, pulso, resplandor, etc.).
- **Catálogo de 14 tipografías Google Fonts:** Integración directa mediante variables CSS (`--landing-font`) con previsualización en el selector.
- **Librería de Plantillas:** Plantillas preconfiguradas para Barbería, Consultorio Médico/Dental, etc.
- **Historial y persistencia:** Deshacer/Rehacer (`undo`/`redo`) con historial de hasta 30 estados en Zustand y guardado automático con debounce.

### C. Dashboard de Gestión
- **Resumen:** Métricas reales calculadas desde base de datos (citas del mes en curso, catálogo de servicios activos y equipo de trabajo).
- **Gestión de Servicios:** CRUD completo con nombre, precio en BOB, duración (minutos), tiempo de colchón (buffer), asociación de profesionales y alternancia de estado (activo/pausado).
- **Gestión de Personal:** CRUD completo con asignación de servicios específicos y mapeo de `googleCalendarId` individual o `primary`.
- **Gestión de Citas:** Vista semanal y diaria, cambio de estado (`confirmed`, `cancelled`, `completed`, `no_show`), reprogramación de citas y agendamiento manual desde el panel.
- **Configuración del Negocio:** Horarios de atención semanales con habilitación día por día, identidad pública (logo, favicon, títulos y descripciones SEO), redes sociales y Facebook Pixel.
- **Facturación & Libélula:** Generación de cobro QR dinámico para suscripción al Plan Pro con polling de estado cada 4s y activación automática de 30 días de suscripción al confirmar pago.
- **Notificaciones Web Push:** Soporte para Firebase Cloud Messaging (FCM) y envío transaccional mediante Resend.

---

## 2. ⚠️ Hallazgos de la auditoría inicial y resolución

Los problemas de esta sección se detectaron durante la revisión inicial. Las correcciones aplicadas se resumen en la sección 4; las tareas externas o de producto aún pendientes están listadas en la sección 5.

### 🔴 Prioridad Alta: Bloque de Reservas (`BookingCalendarBlock.tsx`)
- **Problema reportado por el usuario:** Al vincular Google Calendar, no se puede seleccionar el servicio, el cambio de fecha no responde y solo aparece el botón "Ver horarios del día siguiente".
- **Causa raíz descubierta en la auditoría:**
  1. *Servicio y Staff automático:* Si un negocio no ha registrado un servicio con `active: true` o el `serviceId` se desincroniza, el selector queda bloqueado o en estado indefinido.
  2. *Lógica de fecha pasada / zona horaria:* La comparación `cursor <= now` en `lib/google/availability.ts` descarta todos los turnos del día si la hora del servidor UTC supera la hora local de Bolivia (GMT-4). Cuando no hay horarios disponibles en el día de hoy, el componente muestra el estado vacío y el botón de saltar al día siguiente.
  3. *Mapeo de Staff:* Si los servicios tienen `staffIds: []` y el negocio no tiene integrantes registrados, `availableStaff` queda vacío y `slots` no se calculan si la API espera `staffId`.
  4. *Componente Calendar de HeroUI:* En ciertas versiones de Next.js App Router, `Calendar` de HeroUI requiere valor `CalendarDate` estricto y si no se maneja adecuadamente el evento `onChange`, la vista no dispara la recarga de slots.

### 🔴 Prioridad Alta: Selector de Degradados en el Editor (`BlockStyleProperties.tsx`)
- **Problema reportado por el usuario:** Al seleccionar degradado, se exige que el usuario redacte o entienda código CSS (`linear-gradient(135deg, ...)`), lo cual resulta confuso para el usuario no técnico.
- **Solución requerida:** Diseñar un selector visual intuitivo que permita:
  1. Elegir entre presets categorizados con muestras visuales (degradados modernos, vibrantes, oscuros, suaves).
  2. Un generador visual simple con dos selectores de color (Color Inicial y Color Final) y un selector de dirección (Diagonal, Vertical, Horizontal).
  3. Ocultar el campo de texto CSS avanzado tras un botón desplegable "Personalización avanzada (CSS)" para quienes lo requieran.

### 🟡 Prioridad Media: Desconexión y Manejo de Errores en Google Calendar
- Si los tokens de Google son revocados desde la cuenta de Google del usuario, `getGoogleClient()` falla arrojando excepción sin un mecanismo que automáticamente marque `googleCalendarConnected: false` en Firestore, lo que puede romper temporalmente la consulta de disponibilidad en la landing hasta que el usuario visite ajustes.
- Fallback de disponibilidad: Cuando Google Calendar no responde o falla la red, la función `getAvailableSlots` en `lib/google/availability.ts` atrapa el error pero debe asegurar que los horarios base configurados en el panel siempre se ofrezcan sin bloquear al cliente.

### 🟡 Prioridad Media: Paginación y Búsqueda en Citas
- En `app/api/appointments/route.ts`, se hace una consulta de `limit(100)` sin cursor ni paginación por fecha. Para un negocio con cientos de citas, esto consumirá lecturas de Firestore innecesarias.

---

## 3. 💡 Mejoras recomendadas y estado actual

### Experiencia de Usuario (UX)
1. **Selector de degradados visual:** Completado con presets, controles de colores y dirección, además de CSS avanzado plegable.
2. **Indicador de días disponibles:** Los días cerrados según el horario del negocio ahora aparecen deshabilitados. El calendario aún no anticipa qué días abiertos tienen cupos reales.
3. **Flujo de reserva guiado:** Se muestran sugerencias de fechas próximas cuando no hay horarios; queda por anticipar la disponibilidad real de esas fechas.
4. **Confirmación por WhatsApp:** Implementada con un enlace opcional y mensaje preparado después de reservar; el cliente decide si abre y envía el mensaje.

### Robustez Técnica y Rendimiento
1. **Disponibilidad ante fallos de Google:** Completado con fallback al horario local y citas almacenadas; revisar los logs operativos después del despliegue.
2. **Manejo de zonas horarias:** Completado para disponibilidad y métricas mediante la zona horaria del negocio.
3. **Optimización de imágenes en el Builder:** La carga comprime imágenes grandes y las galerías usan `next/image`, pero desactivan su optimizador (`unoptimized`) para URLs externas. Revisar una allowlist de dominios y carga diferida optimizada sigue pendiente.

---

## 4. 🚀 Plan de Acción y Estado de Implementación

| Fase | Tarea | Impacto | Estado |
| :--- | :--- | :--- | :--- |
| **1** | **Reparación del Flujo de Reserva:** Resuelto en `BookingCalendarBlock.tsx` (Select robusto con textValue, selección de profesional, botones rápidos de fecha "Hoy" y "Mañana", y `Calendar` reactivo) y en `lib/google/availability.ts` (cálculo de día de semana inmune a husos horarios y fallback al calendario `primary`). | 🔴 Crítico | ✅ **Completado y Verificado** |
| **2** | **Selector Visual de Degradados:** Implementado en `BlockStyleProperties.tsx` con generador visual de dos colores (Color A y Color B), 4 botones de dirección (Diagonal, Abajo, Derecha, Inversa) y presets listos en cuadrícula, dejando el CSS avanzado plegable. | 🔴 Crítico | ✅ **Completado y Verificado** |
| **3** | **Robustecimiento de Google Calendar:** Actualizado en `lib/google/client.ts` con detección de tokens revocados (`invalid_grant`), actualización limpia del estado en Firestore y fallback automático a horarios base si la red falla. | 🟡 Alto | ✅ **Completado y Verificado** |
| **4** | **Paginación de citas:** Cursor real con respuesta `items`, `nextCursor` y `hasMore`, integrado con el dashboard. | 🟢 Medio | ✅ **Completado y Verificado** |
| **5** | **Concurrencia de reservas:** Bloqueos transaccionales por cada intervalo de 15 minutos al crear, reprogramar, confirmar o cancelar citas. | 🔴 Alto | ✅ **Completado y Verificado** |
| **6** | **Pagos y suscripciones:** Firma obligatoria de webhook, aplicación idempotente y transaccional del pago y expiración real de beneficios. | 🔴 Alto | ✅ **Completado y Verificado** |
| **7** | **Privacidad y OAuth:** Allowlist de datos públicos, validación de propiedad y OAuth firmado; claves de cifrado dedicadas con lectura transitoria de tokens antiguos. | 🔴 Alto | ✅ **Completado y Verificado** |
| **8** | **Diseño responsive y accesibilidad:** Navegación móvil, agenda compacta, mejoras de portada/editor y correcciones de accesibilidad. | 🟡 Medio | ✅ **Implementado; panel autenticado pendiente de validación visual** |
| **9** | **Reserva intuitiva:** Deshabilitar días cerrados y ofrecer confirmación opcional por WhatsApp tras reservar. | 🟡 Medio | ✅ **Implementado** |

---

## 5. Acciones pendientes y límites de verificación

- Configurar la política TTL de Firestore para `rateLimits.expiresAt`.
- Definir en producción `GOOGLE_TOKEN_ENCRYPTION_KEY`, `LIBELULA_WEBHOOK_SECRET` y las credenciales requeridas de Libélula; al rotar claves de cifrado, conservar temporalmente la anterior en `GOOGLE_TOKEN_ENCRYPTION_KEY_LEGACY`.
- La interfaz pública se revisó en navegador, pero el panel autenticado y las integraciones reales de Google Calendar/Libélula requieren pruebas con cuentas y credenciales de staging.
- El lint completo no presenta errores, pero reporta advertencias acumuladas; también Next.js recomienda migrar la convención `middleware` a `proxy`.
- Persisten como mejoras opcionales el indicador de días con disponibilidad efectiva (más allá del horario semanal) y la configuración segura del optimizador de imágenes para URLs de Storage.

*Fin del informe de auditoría.*

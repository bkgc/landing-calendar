# DEVELOPMENT_GUIDELINES.md - Buenas Prácticas AgendaPro

Este archivo es OBLIGATORIO para Codex y cualquier dev. Define cómo se debe escribir el código.

## 1. STACK Y VERSIONES FIJAS

- Next.js 16.2+ con App Router
- TypeScript Strict Mode `true`
- HeroUI 2.8 - USAR SOLO COMPONENTES DE HEROUI. No inventar botones con divs. Importar de `@heroui/react` o `@nextui-org/react` según versión 2.8
- TailwindCSS 4.3+ - Usar clases utilitarias, NO CSS modules, NO styled-components
- Firebase JS SDK 10+ (modular)

## 2. ESTRUCTURA DE PROYECTO - ESTRICTA

```
/app
  /(auth)
    /login/page.tsx
    /register/page.tsx
  /(dashboard)
    /dashboard
      /layout.tsx (Sidebar + Navbar Dashboard con campana de notificaciones)
      /page.tsx (Overview)
      /editor/page.tsx (Page Builder)
      /services/page.tsx
      /staff/page.tsx
      /appointments/page.tsx
      /billing/page.tsx
      /settings/page.tsx
  /(public)
    /[slug]
      /page.tsx (Landing pública - Server Component)
      /layout.tsx (Theme Provider dinámico)
  /api
    /auth/google/route.ts
    /auth/google/callback/route.ts
    /availability/route.ts (wrapper de getAvailableSlots)
    /appointments/route.ts
    /webhooks/libelula/route.ts
    /webhooks/google-calendar/route.ts
/components
  /ui -> Re-exports de HeroUI para consistencia (ej: MyButton que extiende Button de HeroUI)
  /builder
    /BlockRenderer.tsx -> Renderiza array de bloques (switch type)
    /blocks
      /NavbarBlock.tsx
      /HeroBlock.tsx
      /ServicesBlock.tsx
      /BookingCalendarBlock.tsx (Lógica de disponibilidad + HeroUI Calendar)
      /GalleryBlock.tsx
      /VideoEmbedBlock.tsx (Lógica TikTok/Reels/YT)
      /StaffBlock.tsx
      /TestimonialsBlock.tsx
      /MapContactBlock.tsx
      /FooterBlock.tsx
    /editor
      /Canvas.tsx (dnd-kit contexto)
      /SortableBlock.tsx
      /PropertiesPanel.tsx
      /ThemePanel.tsx
  /dashboard
    /AppointmentTable.tsx
    /ServiceForm.tsx
    /NotificationBell.tsx (Estilo Netflix: Badge + Dropdown)
  /landing -> Componentes solo para la landing pública
/lib
  /firebase
    /config.ts (initializeApp)
    /admin.ts (firebase-admin para Functions y API routes)
    /firestore.ts (helpers tipados)
  /google
    /client.ts (getGoogleClient(businessId) con refresh logic)
    /availability.ts (getAvailableSlots)
  /libelula
    /client.ts (crear suscripción, verificar firma)
  /hooks
    /useBusiness.ts
    /useFCM.ts (lógica de push notifications)
  /utils
    /cn.ts (clsx + tailwind-merge)
    /slugify.ts
    /encrypt.ts (para tokens de Google)
/types
  /business.ts
  /blocks.ts (type Block = NavbarBlock | HeroBlock ...)
  /appointment.ts
/functions -> Cloud Functions v2 si usas Firebase Functions (opcional, puedes usar API routes)

```

## 3. PRINCIPIOS DE CÓDIGO LIMPIO

### A) Componentes

- **Un componente = Un archivo.** No metas 3 componentes en un mismo archivo.
- **Máximo 700 líneas por componente.** Si crece, sepáralo en subcomponentes en `/components/nombre/`.
- Props tipadas con `interface Props` y `zod` para validación.
- Componentes de UI puros (presentacionales) NO hacen fetch. Reciben datos por props.
- Lógica de fetch en Server Components o en hooks custom `/lib/hooks`.

Ejemplo CORRECTO:

```tsx
// components/builder/blocks/HeroBlock.tsx
interface HeroBlockProps {
  title: string;
  subtitle?: string;
  ctaText: string;
  imageUrl: string;
  onCtaClick?: () => void;
}
export const HeroBlock = ({
  title,
  subtitle,
  ctaText,
  imageUrl,
}: HeroBlockProps) => {
  return (
    <section className="relative ...">
      <Button color="primary" size="lg">
        {ctaText}
      </Button>{" "}
      // Componente de HeroUI
    </section>
  );
};
```

### B) Tailwind + HeroUI

- Usa HeroUI para todo lo interactivo: `Button`, `Card`, `Input`, `Modal`, `Calendar`, `DatePicker`, `Badge`, `Avatar`, `Dropdown`.
- Usa Tailwind solo para layout: `flex`, `grid`, `gap`, `p-`, `m-`, `max-w-`.
- NUNCA hagas `<button className="bg-blue-500">`. Usa `<Button color="primary">`.
- El color primario viene del theme del negocio: pásalo via CSS variables.

```tsx
// Correcto
<div className="flex flex-col gap-4 p-6 max-w-7xl mx-auto">
  <Card className="shadow-lg">
    <CardBody>
      <Button color="primary" variant="solid">
        Reservar
      </Button>
    </CardBody>
  </Card>
</div>
```

### C) Firebase - Buenas Prácticas

- NUNCA expongas `serviceAccount` en el cliente. Solo en `/lib/firebase/admin.ts` usado en API routes.
- Usa `serverTimestamp()` para fechas.
- Todas las lecturas/escrituras tipadas: `doc<Business>(...)`
- Reglas de seguridad: Un owner solo puede leer/escribir su `businessId`.
- Para Google Tokens: Encripta `access_token` y `refresh_token` antes de guardar con AES-256 (lib `encrypt.ts`).

### D) Google Calendar Integration - Reglas

- Todo acceso a Google Calendar PASA por `lib/google/client.ts`.
- Esa función debe manejar refresh automático:

```ts
if (token.expiry_date < Date.now()) {
  const newToken = await oauth2Client.refreshAccessToken();
  // guardar nuevo token en Firestore
}
```

- Nunca llames a `googleapis` directo desde un componente cliente.

### E) Notificaciones Estilo Netflix

Implementación:

1.  `lib/hooks/useFCM.ts`:
    - Pide permiso `Notification.requestPermission()`
    - Obtiene token con `getToken(messaging, {vapidKey})`
    - Lo guarda en Firestore `users/{uid}/fcmTokens`
2.  `components/dashboard/NotificationBell.tsx`:
    - Usa `Badge` de HeroUI con `content={unreadCount}`
    - Usa `Dropdown` de HeroUI para mostrar últimas 10 citas.
    - Al hacer click en campana, marca como leídas.
3.  Cloud Function / API Route `onAppointmentCreated`:
    - Usa `firebase-admin/messaging` para enviar `sendMulticast` a los tokens del owner.
    - Payload: `{ notification: {title, body}, webpush: {fcm_options: {link: "/dashboard/appointments"}} }`

### F) Manejo de Estado y Errores

- Usa `Zustand` para estado global del editor (blocks, selectedBlock, theme). No uses Context para esto, es muy pesado.
- Usa `react-hook-form + zodResolver` para todos los formularios (servicios, staff, reserva).
- Todos los API routes retornan `{success: boolean, data?, error?}`.
- Usa `sonner` o `HeroUI Toast` para feedback.

## 4. CONVENCIONES

- Nombres de archivos: `PascalCase` para componentes, `kebab-case` para utils, `camelCase` para hooks.
- Commits semánticos: `feat: builder drag&drop`, `fix: google refresh token`, `chore: firebase rules`
- Variables de entorno en `.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
FIREBASE_ADMIN_PRIVATE_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
LIBELULA_API_KEY=
LIBELULA_WEBHOOK_SECRET=
NEXT_PUBLIC_FCM_VAPID_KEY=
```

- No dejar `console.log` en producción. Usa `logger` utility.

## 5. PERFORMANCE

- Landing pública `[slug]` debe ser Server Component y usar `revalidate = 60` (ISR) para que no consulte Firestore en cada visita.
- Imágenes con `next/image` y loader de Firebase Storage.
- Video embeds con `loading="lazy"` y facades (no cargar iframe de TikTok hasta hacer click).

## 6. SEGURIDAD

- Validar `slug` con regex `^[a-z0-9-]+$` y longitud 3-30.
- Sanitizar URLs de video embed: solo permitir dominios `tiktok.com`, `instagram.com`, `youtube.com`, `youtu.be`.
- Rate limiting en `/api/availability` y `/api/appointments` (usar `upstash/ratelimit` o similar).
- Encriptar tokens de Google.

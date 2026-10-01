export type BlockType =
  | "navbar"
  | "hero"
  | "services"
  | "booking_calendar"
  | "gallery"
  | "video_embed"
  | "staff"
  | "testimonials"
  | "text_image"
  | "faq"
  | "map_contact"
  | "footer"
  | "container"
  | "image_carousel"
  | "features"
  | "stats"
  | "call_to_action";

export type LandingAnimation =
  | "none"
  // Entrada
  | "fade_in"
  | "fade_up"
  | "slide_left"
  | "slide_right"
  | "zoom_in"
  | "bounce_in"
  | "flip_in"
  // Salida
  | "fade_out"
  | "slide_down"
  | "zoom_out"
  // Bucle
  | "float"
  | "pulse"
  | "shimmer"
  | "glow"
  | "bounce_gentle"
  | "spin_slow";

export interface BlockStyleProps {
  bgType?: "default" | "solid" | "gradient" | "image";
  bgColor?: string;
  bgGradient?: string;
  bgImageUrl?: string;
  bgOverlayOpacity?: number; // 0 a 100
  textColor?: "default" | "light" | "dark";
  animation?: LandingAnimation;
  align?: "left" | "center" | "right";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
}

export type LandingElementType = "text" | "image" | "button" | "stat";

export interface LandingElement {
  id: string;
  type: LandingElementType;
  animation?: LandingAnimation;
  eyebrow?: string;
  title?: string;
  body?: string;
  value?: string;
  label?: string;
  url?: string;
  alt?: string;
  href?: string;
}

export interface LandingTheme {
  primary: string;
  background: string;
  foreground: string;
  font: string;
  radius: "sm" | "md" | "lg" | "full";
}

export const LANDING_FONT_STACKS: Record<string, string> = {
  Inter: "Inter, ui-sans-serif, system-ui, sans-serif",
  "DM Sans": '"DM Sans", ui-sans-serif, system-ui, sans-serif',
  Manrope: "Manrope, ui-sans-serif, system-ui, sans-serif",
  Outfit: "Outfit, ui-sans-serif, system-ui, sans-serif",
  Poppins: "Poppins, ui-sans-serif, system-ui, sans-serif",
  Montserrat: "Montserrat, ui-sans-serif, system-ui, sans-serif",
  "Plus Jakarta Sans": '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
  "Space Grotesk": '"Space Grotesk", ui-sans-serif, system-ui, sans-serif',
  "Playfair Display": '"Playfair Display", Georgia, serif',
  Lora: "Lora, Georgia, serif",
  Cinzel: "Cinzel, Georgia, serif",
  Caveat: "Caveat, cursive",
  Syne: "Syne, ui-sans-serif, system-ui, sans-serif",
  Roboto: "Roboto, ui-sans-serif, system-ui, sans-serif",
};

export function getLandingFontStack(font: string) {
  return LANDING_FONT_STACKS[font] || LANDING_FONT_STACKS.Inter;
}

export interface LandingBlock<TProps = Record<string, unknown>> {
  id: string;
  type: BlockType;
  props: TProps;
}

export interface NavbarBlockProps extends BlockStyleProps {
  logoUrl?: string;
  brandName?: string;
  links: Array<{ label: string; href: string }>;
  ctaText: string;
  ctaHref?: string;
  layout?: "spread" | "centered" | "minimal";
}

export interface HeroBlockProps extends BlockStyleProps {
  title: string;
  subtitle?: string;
  ctaText: string;
  imageUrl?: string;
  ctaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  badgeText?: string;
  layout?: "split" | "centered" | "image_background";
  imagePosition?: "left" | "right";
  textAnimation?: LandingAnimation;
  imageAnimation?: LandingAnimation;
}

export interface ServicesBlockProps extends BlockStyleProps {
  title?: string;
  subtitle?: string;
  columns?: 2 | 3 | 4;
}

export interface BookingCalendarBlockProps extends BlockStyleProps {
  title?: string;
  subtitle?: string;
  layout?: "centered" | "split";
}

export interface GalleryBlockProps extends BlockStyleProps {
  title?: string;
  subtitle?: string;
  images: Array<{ url: string; alt: string }>;
  columns: 2 | 3 | 4;
}

export interface VideoEmbedBlockProps extends BlockStyleProps {
  title?: string;
  subtitle?: string;
  url: string;
  aspectRatio?: "16:9" | "9:16" | "4:3";
}

export interface TestimonialsBlockProps extends BlockStyleProps {
  title?: string;
  subtitle?: string;
  columns?: 2 | 3;
  testimonials: Array<{
    quote: string;
    name: string;
    avatar?: string;
    stars: number;
    role?: string;
  }>;
}

export interface StaffBlockProps extends BlockStyleProps {
  title?: string;
  subtitle?: string;
  columns?: 2 | 3 | 4;
}

export interface FooterBlockProps extends BlockStyleProps {
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  copyrightText?: string;
}

export interface TextImageBlockProps extends BlockStyleProps {
  title: string;
  text: string;
  imageUrl?: string;
  imagePosition: "left" | "right";
  badgeText?: string;
  ctaText?: string;
  ctaHref?: string;
  textAnimation?: LandingAnimation;
  imageAnimation?: LandingAnimation;
}

export interface FaqBlockProps extends BlockStyleProps {
  title?: string;
  subtitle?: string;
  items: Array<{ question: string; answer: string }>;
}

export interface MapContactBlockProps extends BlockStyleProps {
  title?: string;
  subtitle?: string;
  address?: string;
  mapUrl?: string;
  whatsapp?: string;
  instagram?: string;
  layout?: "split" | "map_first" | "stacked";
}

export interface ContainerBlockProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  layout: "stack" | "split" | "grid";
  align: "left" | "center";
  background?: string;
  padding: "sm" | "md" | "lg";
  elements: LandingElement[];
}

export interface ImageCarouselBlockProps {
  title?: string;
  subtitle?: string;
  images: Array<{ url: string; alt: string }>;
  interval: number;
  autoplay: boolean;
  transition: "fade" | "slide" | "ken_burns";
  animation?: LandingAnimation;
}

export interface FeatureItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface FeaturesBlockProps extends BlockStyleProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  columns?: 2 | 3 | 4;
  items: FeatureItem[];
  animation?: LandingAnimation;
}

export interface StatItem {
  id: string;
  value: string;
  label: string;
  suffix?: string;
}

export interface StatsBlockProps extends BlockStyleProps {
  title?: string;
  subtitle?: string;
  columns?: 2 | 3 | 4;
  items: StatItem[];
  animation?: LandingAnimation;
}

export interface CallToActionBlockProps extends BlockStyleProps {
  badgeText?: string;
  title: string;
  subtitle?: string;
  ctaText: string;
  ctaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  backgroundStyle?: "primary" | "dark" | "soft";
  buttonLayout?: "row" | "column";
  animation?: LandingAnimation;
}

export type LandingConfig = {
  theme: LandingTheme;
  blocks: Array<LandingBlock>;
};

export const BLOCK_LABELS: Record<BlockType, string> = {
  navbar: "Navegación",
  hero: "Hero principal",
  features: "Beneficios / Características",
  stats: "Métricas destacadas",
  services: "Servicios",
  booking_calendar: "Agenda de reservas",
  call_to_action: "Llamada a la acción (CTA)",
  gallery: "Galería",
  video_embed: "Video",
  staff: "Equipo",
  testimonials: "Testimonios",
  text_image: "Texto e imagen",
  faq: "Preguntas frecuentes",
  map_contact: "Contacto y mapa",
  footer: "Pie de página",
  container: "Contenedor flexible",
  image_carousel: "Carrusel de imágenes",
};

export function createBlockProps(type: BlockType): Record<string, unknown> {
  switch (type) {
    case "navbar":
      return { links: [], ctaText: "Reservar" };
    case "hero":
      return {
        title: "Reserva tu próxima cita",
        subtitle: "Elige un servicio y encuentra un horario disponible.",
        ctaText: "Reservar ahora",
        ctaHref: "#reservar",
        layout: "split",
        textAnimation: "fade_up",
        imageAnimation: "zoom_in",
      };
    case "services":
      return {
        title: "Elige lo que necesitas",
        subtitle:
          "Horarios claros, precios transparentes y una reserva sin vueltas.",
      };
    case "booking_calendar":
      return {
        title: "Encuentra tu horario",
        subtitle:
          "Elige un servicio, revisa los días activos y selecciona una hora libre.",
      };
    case "gallery":
      return { title: "Conoce nuestro espacio", images: [], columns: 3 };
    case "video_embed":
      return { title: "Mira nuestro trabajo", url: "" };
    case "testimonials":
      return { title: "Lo que dicen nuestros clientes", testimonials: [] };
    case "text_image":
      return {
        title: "Una experiencia pensada para ti",
        text: "Cuenta qué hace especial a tu negocio.",
        imagePosition: "right",
        textAnimation: "fade_up",
        imageAnimation: "slide_left",
      };
    case "faq":
      return { title: "Preguntas frecuentes", items: [] };
    case "map_contact":
      return { title: "Encuéntranos", address: "" };
    case "staff":
      return {
        title: "Nuestro equipo",
        subtitle: "Personas listas para atenderte.",
      };
    case "footer":
      return {
        description: "Reserva cuando te quede bien.",
        ctaText: "Reservar",
      };
    case "container":
      return {
        eyebrow: "Diseñado para tu negocio",
        title: "Una sección hecha a tu medida",
        subtitle:
          "Combina texto, imágenes, botones y datos en un solo espacio.",
        layout: "split",
        align: "left",
        background: "#f5f7f5",
        padding: "lg",
        elements: [
          {
            id: `text-${crypto.randomUUID()}`,
            type: "text",
            title: "Cuenta tu historia",
            body: "Explica qué hace especial a tu negocio.",
            animation: "fade_up",
          },
          {
            id: `image-${crypto.randomUUID()}`,
            type: "image",
            url: "",
            alt: "",
            animation: "zoom_in",
          },
        ],
      };
    case "image_carousel":
      return {
        title: "Conoce nuestro espacio",
        subtitle: "Una mirada rápida a lo que hacemos.",
        images: [],
        interval: 4500,
        autoplay: true,
        transition: "fade",
        animation: "fade_up",
      };
    case "features":
      return {
        eyebrow: "¿POR QUÉ ELEGIRNOS?",
        title: "Calidad y atención que marcan la diferencia",
        subtitle: "Diseñado para darte la mejor experiencia desde el primer momento.",
        columns: 3,
        animation: "fade_up",
        items: [
          {
            id: `feat-${crypto.randomUUID()}`,
            icon: "sparkles",
            title: "Atención personalizada",
            description: "Cada detalle está pensado para brindarte un servicio único y dedicado.",
          },
          {
            id: `feat-${crypto.randomUUID()}`,
            icon: "clock",
            title: "Puntualidad garantizada",
            description: "Respetamos tu tiempo con agendas precisas sin tiempos muertos.",
          },
          {
            id: `feat-${crypto.randomUUID()}`,
            icon: "shield",
            title: "Profesionales expertos",
            description: "Equipo capacitado y con amplia trayectoria en cada especialidad.",
          },
        ],
      };
    case "stats":
      return {
        title: "Nuestra experiencia en números",
        subtitle: "Resultados comprobados que respaldan la confianza de nuestros clientes.",
        animation: "fade_up",
        items: [
          {
            id: `stat-${crypto.randomUUID()}`,
            value: "1,500+",
            label: "Clientes felices",
          },
          {
            id: `stat-${crypto.randomUUID()}`,
            value: "99%",
            label: "Satisfacción",
          },
          {
            id: `stat-${crypto.randomUUID()}`,
            value: "5+",
            label: "Años de experiencia",
          },
          {
            id: `stat-${crypto.randomUUID()}`,
            value: "4.9",
            label: "Calificación promedio",
          },
        ],
      };
    case "call_to_action":
      return {
        badgeText: "RESERVA ONLINE EN SEGUNDOS",
        title: "¿Listo para transformar tu día?",
        subtitle: "Elige tu servicio favorito y asegura tu lugar en nuestra agenda en menos de 1 minuto.",
        ctaText: "Reservar mi cita ahora",
        ctaHref: "#reservar",
        secondaryCtaText: "Ver catálogo de servicios",
        secondaryCtaHref: "#servicios",
        backgroundStyle: "primary",
        animation: "fade_up",
      };
    default:
      return {};
  }
}

export const DEFAULT_LANDING_CONFIG: LandingConfig = {
  theme: {
    primary: "#0f766e",
    background: "#ffffff",
    foreground: "#111827",
    font: "Inter",
    radius: "lg",
  },
  blocks: [
    {
      id: "navbar-default",
      type: "navbar",
      props: createBlockProps("navbar"),
    },
    {
      id: "hero-default",
      type: "hero",
      props: createBlockProps("hero"),
    },
    { id: "services-default", type: "services", props: {} },
    { id: "booking-default", type: "booking_calendar", props: {} },
    { id: "footer-default", type: "footer", props: {} },
  ],
};

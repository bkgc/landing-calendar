import type { LandingConfig } from "@/types/blocks";

export interface LandingTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  badge: string;
  previewColor: string;
  config: LandingConfig;
}

export const LANDING_TEMPLATES: LandingTemplate[] = [
  {
    id: "barbershop",
    name: "Barbería & Salón Masculino",
    category: "Belleza & Estilo",
    description:
      "Diseño oscuro y elegante con tonos dorados. Ideal para barberías, estéticas masculinas y peluquerías modernas.",
    icon: "✂️",
    badge: "Estilo Urbano",
    previewColor: "#c29b38",
    config: {
      theme: {
        primary: "#c29b38",
        background: "#0f172a",
        foreground: "#f8fafc",
        font: "Outfit",
        radius: "md",
      },
      blocks: [
        {
          id: "navbar-template",
          type: "navbar",
          props: {
            brandName: "Barber Studio",
            ctaText: "Reservar turno",
            links: [
              { label: "Servicios", href: "#servicios" },
              { label: "Equipo", href: "#equipo" },
              { label: "Ubicación", href: "#contacto" },
            ],
            sticky: true,
          },
        },
        {
          id: "hero-template-barber",
          type: "hero",
          props: {
            title: "Cortes de Autor y Estilo con Personalidad",
            subtitle:
              "Perfilado de barba, cortes clásicos y modernos, y tratamientos capilares en un ambiente exclusivo.",
            ctaText: "Agendar Turno Ahora",
            bgType: "gradient",
            bgGradient: "linear-gradient(135deg, #09090b 0%, #18181b 50%, #27272a 100%)",
            textColor: "light",
            animation: "fade_in",
          },
        },
        {
          id: "features-template-barber",
          type: "features",
          props: {
            title: "¿Por qué atendemos diferente?",
            subtitle: "La experiencia premium que te mereces en cada visita.",
            items: [
              {
                title: "Puntualidad Absoluta",
                description: "Tu turno inicia a la hora reservada, sin esperas innecesarias.",
              },
              {
                title: "Maestros Barberos",
                description: "Técnicas tradicionales a navaja combinadas con lo último en tendencias.",
              },
              {
                title: "Bebida de Cortesía",
                description: "Disfruta de un espresso o bebida refrescante mientras transformamos tu look.",
              },
            ],
            animation: "fade_up",
          },
        },
        {
          id: "services-template-barber",
          type: "services",
          props: {
            title: "Nuestros Servicios",
            subtitle: "Elige el servicio que deseas y mira las opciones disponibles.",
            showPrice: true,
            showDuration: true,
            columns: 3,
            animation: "fade_up",
          },
        },
        {
          id: "staff-template-barber",
          type: "staff",
          props: {
            title: "Conoce al Equipo",
            subtitle: "Profesionales apasionados por el detalle y la estética.",
            columns: 3,
            animation: "fade_in",
          },
        },
        {
          id: "booking-template-barber",
          type: "booking_calendar",
          props: {
            title: "Reserva Tu Turno en Línea",
            subtitle: "Selecciona el día y la hora que mejor te acomoden.",
            showStaffSelector: true,
            animation: "none",
          },
        },
        {
          id: "map-template-barber",
          type: "map_contact",
          props: {
            title: "Encuéntranos",
            subtitle: "Estamos en una zona accesible con parqueo disponible.",
            address: "Av. Principal #450, Zona Central",
            phone: "+591 70000000",
            whatsapp: "59170000000",
            email: "contacto@barberstudio.bo",
            animation: "fade_in",
          },
        },
        {
          id: "footer-template-barber",
          type: "footer",
          props: {
            text: "© 2026 Barber Studio · Todos los derechos reservados.",
          },
        },
      ],
    },
  },
  {
    id: "clinic",
    name: "Consultorio Médico o Dental",
    category: "Salud & Bienestar",
    description:
      "Diseño pulcro, profesional y luminoso. Diseñado para médicos, odontólogos, fisioterapeutas y centros de salud.",
    icon: "🩺",
    badge: "Clínico y Confiable",
    previewColor: "#0284c7",
    config: {
      theme: {
        primary: "#0284c7",
        background: "#ffffff",
        foreground: "#0f172a",
        font: "Inter",
        radius: "lg",
      },
      blocks: [
        {
          id: "navbar-template-clinic",
          type: "navbar",
          props: {
            brandName: "Clínica Dental & Salud",
            ctaText: "Agendar Consulta",
            links: [
              { label: "Especialidades", href: "#servicios" },
              { label: "Especialistas", href: "#equipo" },
              { label: "Preguntas", href: "#faq" },
            ],
            sticky: true,
          },
        },
        {
          id: "hero-template-clinic",
          type: "hero",
          props: {
            title: "Tu Sonrisa y Salud en Manos de Especialistas",
            subtitle:
              "Atención personalizada con tecnología diagnóstica avanzada y protocolos rigurosos de bioseguridad.",
            ctaText: "Reservar Cita Médica",
            bgType: "gradient",
            bgGradient: "linear-gradient(135deg, #f0fdf4 0%, #ecfeff 50%, #fdf4ff 100%)",
            textColor: "default",
            animation: "fade_in",
          },
        },
        {
          id: "features-template-clinic",
          type: "features",
          props: {
            title: "Atención de Excelencia",
            subtitle: "Pensada para tu comodidad, tranquilidad y bienestar integral.",
            items: [
              {
                title: "Equipamiento Digital",
                description: "Diagnósticos precisos en tu primera consulta con tecnología sin dolor.",
              },
              {
                title: "Sin Filas ni Esperas",
                description: "Sistema de turnos exacto y recordatorios automáticos por WhatsApp.",
              },
              {
                title: "Atención para Toda la Familia",
                description: "Especialistas en odontopediatría, ortodoncia, estética y medicina general.",
              },
            ],
            animation: "fade_up",
          },
        },
        {
          id: "services-template-clinic",
          type: "services",
          props: {
            title: "Nuestras Especialidades",
            subtitle: "Consultas y tratamientos disponibles para agendar.",
            showPrice: true,
            showDuration: true,
            columns: 3,
            animation: "fade_up",
          },
        },
        {
          id: "booking-template-clinic",
          type: "booking_calendar",
          props: {
            title: "Agenda tu Cita en Segundos",
            subtitle: "Consulta la disponibilidad del calendario en tiempo real.",
            showStaffSelector: true,
            animation: "none",
          },
        },
        {
          id: "faq-template-clinic",
          type: "faq",
          props: {
            title: "Preguntas Frecuentes",
            subtitle: "Todo lo que necesitas saber antes de tu consulta.",
            items: [
              {
                question: "¿Qué debo llevar a mi primera consulta?",
                answer: "Únicamente tu cédula de identidad y estudios previos si cuentas con ellos.",
              },
              {
                question: "¿Puedo reprogramar mi cita si tengo un imprevisto?",
                answer: "Sí, puedes reprogramar hasta con 3 horas de anticipación desde el enlace de confirmación.",
              },
              {
                question: "¿Aceptan pagos con QR y transferencias?",
                answer: "Aceptamos QR Simple, transferencias bancarias y tarjetas de débito/crédito.",
              },
            ],
            animation: "fade_in",
          },
        },
        {
          id: "footer-template-clinic",
          type: "footer",
          props: {
            text: "© 2026 Clínica Dental & Salud · Registro Profesional de Salud Vigente.",
          },
        },
      ],
    },
  },
  {
    id: "spa-beauty",
    name: "Spa & Centro de Estética",
    category: "Belleza & Cuidado Personal",
    description:
      "Tonos suaves, bordes redondeados y aire zen. Perfecto para spas, masajes, cosmetología, uñas y pestañas.",
    icon: "💅",
    badge: "Zen & Elegante",
    previewColor: "#d946ef",
    config: {
      theme: {
        primary: "#d946ef",
        background: "#faf5ff",
        foreground: "#18181b",
        font: "Outfit",
        radius: "full",
      },
      blocks: [
        {
          id: "navbar-template-spa",
          type: "navbar",
          props: {
            brandName: "Harmonie Spa & Estética",
            ctaText: "Reservar Experiencia",
            links: [
              { label: "Tratamientos", href: "#servicios" },
              { label: "Testimonios", href: "#testimonios" },
              { label: "Contacto", href: "#contacto" },
            ],
            sticky: true,
          },
        },
        {
          id: "hero-template-spa",
          type: "hero",
          props: {
            title: "Regálate un Momento de Auténtico Bienestar",
            subtitle:
              "Masajes relajantes, limpieza facial profunda y estética corporal con productos orgánicos de alta gama.",
            ctaText: "Elige Tu Sesión de Relax",
            bgType: "gradient",
            bgGradient: "linear-gradient(135deg, #fdf4ff 0%, #fae8ff 50%, #f5d0fe 100%)",
            textColor: "default",
            animation: "fade_in",
          },
        },
        {
          id: "services-template-spa",
          type: "services",
          props: {
            title: "Tratamientos Exclusivos",
            subtitle: "Sesiones diseñadas para revitalizar tu piel, cuerpo y mente.",
            showPrice: true,
            showDuration: true,
            columns: 3,
            animation: "fade_up",
          },
        },
        {
          id: "testimonials-template-spa",
          type: "testimonials",
          props: {
            title: "Experiencias de Nuestras Clientas",
            subtitle: "La tranquilidad y satisfacción que nos caracteriza.",
            items: [
              {
                quote: "El masaje con piedras calientes es una maravilla. Salí totalmente renovada y la atención es de 10.",
                name: "Camila R.",
                stars: 5,
              },
              {
                quote: "El mejor facial que me he hecho en La Paz. Cuidan cada detalle y la piel queda luminosa.",
                name: "Valeria M.",
                stars: 5,
              },
            ],
            animation: "fade_in",
          },
        },
        {
          id: "booking-template-spa",
          type: "booking_calendar",
          props: {
            title: "Reserva Tu Espacio de Armonía",
            subtitle: "Elige el día y la hora para consentirte.",
            showStaffSelector: true,
            animation: "none",
          },
        },
        {
          id: "footer-template-spa",
          type: "footer",
          props: {
            text: "© 2026 Harmonie Spa · Belleza, salud y relajación.",
          },
        },
      ],
    },
  },
  {
    id: "consulting",
    name: "Consultoría & Servicios Profesionales",
    category: "Negocios & Finanzas",
    description:
      "Aspecto corporativo, directo y confiable. Ideal para abogados, contadores, agencias y consultores estratégicos.",
    icon: "⚖️",
    badge: "Corporativo & Estratégico",
    previewColor: "#11766f",
    config: {
      theme: {
        primary: "#11766f",
        background: "#ffffff",
        foreground: "#172025",
        font: "Space Grotesk",
        radius: "sm",
      },
      blocks: [
        {
          id: "navbar-template-consulting",
          type: "navbar",
          props: {
            brandName: "Nexus Asesoría & Legal",
            ctaText: "Agendar Reunión",
            links: [
              { label: "Servicios", href: "#servicios" },
              { label: "Consultores", href: "#equipo" },
              { label: "Preguntas", href: "#faq" },
            ],
            sticky: true,
          },
        },
        {
          id: "hero-template-consulting",
          type: "hero",
          props: {
            title: "Impulsamos el Crecimiento Seguro de Tu Negocio",
            subtitle:
              "Soluciones legales, fiscales y estratégicas con respaldo profesional para empresas y emprendedores en Bolivia.",
            ctaText: "Agendar Sesión de Diagnóstico",
            bgType: "gradient",
            bgGradient: "linear-gradient(135deg, #064e3b 0%, #0f766e 100%)",
            textColor: "light",
            animation: "fade_in",
          },
        },
        {
          id: "stats-template-consulting",
          type: "stats",
          props: {
            title: "Nuestra Trayectoria en Cifras",
            subtitle: "Resultados tangibles que respaldan nuestro compromiso.",
            items: [
              { label: "Empresas Asesoradas", value: "+350" },
              { label: "Años de Experiencia", value: "12" },
              { label: "Efectividad en Casos", value: "98%" },
              { label: "Soporte Continuo", value: "24/7" },
            ],
            animation: "fade_up",
          },
        },
        {
          id: "services-template-consulting",
          type: "services",
          props: {
            title: "Áreas de Asesoría",
            subtitle: "Elige la consulta que requieres para tu empresa.",
            showPrice: true,
            showDuration: true,
            columns: 3,
            animation: "fade_up",
          },
        },
        {
          id: "staff-template-consulting",
          type: "staff",
          props: {
            title: "Nuestros Asesores Principales",
            subtitle: "Especialistas en derecho comercial, laboral y tributación.",
            columns: 3,
            animation: "fade_in",
          },
        },
        {
          id: "booking-template-consulting",
          type: "booking_calendar",
          props: {
            title: "Programa una Sesión de Trabajo",
            subtitle: "Selecciona horario para reunión virtual o presencial.",
            showStaffSelector: true,
            animation: "none",
          },
        },
        {
          id: "footer-template-consulting",
          type: "footer",
          props: {
            text: "© 2026 Nexus Consultores · Asesoría Legal y Corporativa.",
          },
        },
      ],
    },
  },
];

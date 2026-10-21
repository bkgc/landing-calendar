"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Globe2,
  Palette,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button, Card, CardBody, Chip, Progress } from "@/components/ui";
import { useAuth } from "@/lib/hooks/useAuth";
import { businessDateAndTime } from "@/lib/utils/date";

export default function DashboardPage() {
  const { business, user } = useAuth();
  const firstName = user?.displayName?.split(" ")[0] || "ahí";
  const trialEnd = business?.trialEndsAt?.toDate
    ? business.trialEndsAt
        .toDate()
        .toLocaleDateString("es-BO", { day: "numeric", month: "long" })
    : null;

  const [statsData, setStatsData] = useState({
    appointmentsCount: 0,
    servicesCount: 0,
    staffCount: 0,
    loading: true,
  });

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetch("/api/appointments?limit=300")
        .then((r) => r.json())
        .catch(() => ({ success: false, data: [] })),
      fetch("/api/business/services")
        .then((r) => r.json())
        .catch(() => ({ success: false, data: [] })),
      fetch("/api/business/staff")
        .then((r) => r.json())
        .catch(() => ({ success: false, data: [] })),
    ]).then(([appointmentsRes, servicesRes, staffRes]) => {
      if (!isMounted) return;
      const now = new Date();
      const currentMonth = businessDateAndTime(now).date.slice(0, 7);

      let appointmentsCount = 0;
      if (
        appointmentsRes.success &&
        Array.isArray(appointmentsRes.data?.items)
      ) {
        appointmentsCount = appointmentsRes.data.items.filter(
          (apt: { start?: string; status?: string }) => {
            if (!apt.start || apt.status === "cancelled") return false;
            return businessDateAndTime(apt.start).date.startsWith(currentMonth);
          },
        ).length;
      }

      let servicesCount = 0;
      if (servicesRes.success && Array.isArray(servicesRes.data)) {
        servicesCount = servicesRes.data.filter(
          (s: { active?: boolean }) => s.active !== false,
        ).length;
      }

      let staffCount = 0;
      if (staffRes.success && Array.isArray(staffRes.data)) {
        staffCount = staffRes.data.length;
      }

      setStatsData({
        appointmentsCount,
        servicesCount,
        staffCount,
        loading: false,
      });
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = [
    {
      label: "Citas este mes",
      value: statsData.loading ? "…" : String(statsData.appointmentsCount),
      detail:
        statsData.appointmentsCount > 0
          ? `${statsData.appointmentsCount} reserva${statsData.appointmentsCount > 1 ? "s" : ""} agendada${statsData.appointmentsCount > 1 ? "s" : ""}`
          : "Aún no hay reservas este mes",
      icon: CalendarDays,
      tone: "bg-[#e5f3f0] text-[#11766f]",
    },
    {
      label: "Servicios activos",
      value: statsData.loading ? "…" : String(statsData.servicesCount),
      detail:
        statsData.servicesCount > 0
          ? `${statsData.servicesCount} servicio${statsData.servicesCount > 1 ? "s" : ""} disponible${statsData.servicesCount > 1 ? "s" : ""}`
          : "Configura tu catálogo",
      icon: Palette,
      tone: "bg-[#fff0e8] text-[#c85f3f]",
    },
    {
      label: "Personas en tu equipo",
      value: statsData.loading ? "…" : String(statsData.staffCount),
      detail:
        statsData.staffCount > 0
          ? `${statsData.staffCount} profesional${statsData.staffCount > 1 ? "es" : ""}`
          : "Agrega tu primer integrante",
      icon: Users,
      tone: "bg-[#eef1f8] text-[#53658f]",
    },
  ];

  let setupProgress = business?.slug ? 25 : 0;
  if (statsData.servicesCount > 0) setupProgress += 25;
  if (statsData.staffCount > 0) setupProgress += 25;
  if (business?.googleCalendarConnected) setupProgress += 25;
  setupProgress = Math.min(100, setupProgress);

  return (
    <section className="space-y-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--app-primary)]">
            Resumen
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
            Hola, {firstName}
          </h1>
          <p className="mt-2 text-[var(--app-muted)]">
            Este es el pulso de {business?.name || "tu negocio"} hoy.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            as={Link}
            href="/dashboard/editor"
            variant="bordered"
            startContent={<Palette size={16} />}
          >
            Editar landing
          </Button>
          <Button
            as={Link}
            color="primary"
            href={business?.slug ? `/${business.slug}` : "/dashboard/settings"}
            target="_blank"
            endContent={<ArrowUpRight size={16} />}
          >
            Ver página
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              className="border border-[var(--app-line)] shadow-none"
              key={stat.label}
            >
              <CardBody className="gap-4 p-5">
                <div className="flex items-start justify-between">
                  <div
                    className={`flex size-10 items-center justify-center rounded-xl ${stat.tone}`}
                  >
                    <Icon size={19} />
                  </div>
                  <span className="text-3xl font-semibold tracking-tight">
                    {stat.value}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{stat.label}</p>
                  <p className="mt-1 text-sm text-[var(--app-muted)]">
                    {stat.detail}
                  </p>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.6fr)]">
        <Card className="border border-[var(--app-line)] shadow-none">
          <CardBody className="gap-6 p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--app-primary)]">
                  Primeros pasos
                </p>
                <h2 className="mt-1 text-2xl font-semibold">
                  Tu espacio está listo para tomar forma
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--app-muted)]">
                  Completa estos pasos y tendrás una página lista para compartir
                  con tus clientes.
                </p>
              </div>
              <Chip color={setupProgress === 100 ? "success" : "primary"} variant="flat">
                {setupProgress === 100 ? "Completado" : `${setupProgress}%`}
              </Chip>
            </div>
            <div className="space-y-4">
              <Progress
                aria-label="Progreso de configuración"
                className="max-w-xl"
                color="primary"
                value={setupProgress}
              />
              <div className="grid gap-3 sm:grid-cols-3">
                <Button
                  as={Link}
                  className="h-auto justify-start whitespace-normal p-4 text-left"
                  href="/dashboard/editor"
                  startContent={<Palette size={18} />}
                  variant="flat"
                >
                  <span>
                    <span className="block font-medium">Diseña tu landing</span>
                    <span className="mt-1 block text-xs font-normal text-[var(--app-muted)]">
                      Elige bloques y colores
                    </span>
                  </span>
                </Button>
                <Button
                  as={Link}
                  className="h-auto justify-start whitespace-normal p-4 text-left"
                  href="/dashboard/services"
                  startContent={<Globe2 size={18} />}
                  variant="flat"
                >
                  <span>
                    <span className="block font-medium">Agrega servicios</span>
                    <span className="mt-1 block text-xs font-normal text-[var(--app-muted)]">
                      Muestra lo que ofreces
                    </span>
                  </span>
                </Button>
                <Button
                  as={Link}
                  className="h-auto justify-start whitespace-normal p-4 text-left"
                  href="/dashboard/settings"
                  startContent={<CalendarDays size={18} />}
                  variant="flat"
                >
                  <span>
                    <span className="block font-medium">                    Conecta Google Calendar</span>
                    <span className="mt-1 block text-xs font-normal text-[var(--app-muted)]">
                      Evita cruces de horario
                    </span>
                  </span>
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card className="border border-[var(--app-line)] bg-[#172025] text-white shadow-none">
          <CardBody className="gap-5 p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#a6d8d0]">
                {business?.plan === "pro" ? "Plan Pro Activo" : "Prueba gratuita"}
              </p>
              <Chip className="bg-white/10 text-white" size="sm" variant="flat">
                {business?.plan === "pro" ? "PRO" : "FREE"}
              </Chip>
            </div>
            <div>
              <p className="text-3xl font-semibold">
                {business?.plan === "pro" ? "Ilimitado" : "7 días"}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/65">
                {business?.plan === "pro"
                  ? "Tienes acceso completo a todas las funcionalidades avanzadas."
                  : `Tu prueba está activa hasta ${trialEnd || "pronto"}. Explora el editor y prepara tu página.`}
              </p>
            </div>
            <Button
              as={Link}
              className="w-fit bg-white text-[#172025]"
              href="/dashboard/billing"
              endContent={<ArrowUpRight size={16} />}
            >
              Ver planes
            </Button>
          </CardBody>
        </Card>
      </div>
    </section>
  );
}

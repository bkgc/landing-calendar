"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock3,
  Sparkles,
} from "lucide-react";

import { Logo } from "@/components/icons";
import { Button, Card, CardBody, Chip, Divider } from "@/components/ui";

const appointments = [
  {
    time: "09:30",
    name: "María Fernanda",
    service: "Manicure gel",
    tone: "bg-[#e4f3ef]",
  },
  {
    time: "11:00",
    name: "Daniela Rojas",
    service: "Corte + brushing",
    tone: "bg-[#fff0e8]",
  },
  {
    time: "15:30",
    name: "Sofía Vargas",
    service: "Diseño de cejas",
    tone: "bg-[#eef1f8]",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f7f5] text-[#172025]">
      <header className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 lg:px-10">
        <Link
          className="flex items-center gap-2.5 font-semibold tracking-tight"
          href="/"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#11766f] text-white">
            <Logo size={22} />
          </span>
          <span className="text-lg">AgendaPro</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-[#68737a] md:flex">
          <Link
            className="transition-colors hover:text-[#172025]"
            href="#como-funciona"
          >
            Cómo funciona
          </Link>
          <Link
            className="transition-colors hover:text-[#172025]"
            href="#herramientas"
          >
            Herramientas
          </Link>
          <Link
            className="transition-colors hover:text-[#172025]"
            href="/login"
          >
            Ingresar
          </Link>
          <Button
            as={Link}
            color="primary"
            href="/register"
            endContent={<ArrowUpRight size={16} />}
          >
            Crear mi negocio
          </Button>
        </nav>
        <Button
          className="md:hidden"
          as={Link}
          color="primary"
          href="/register"
          size="sm"
        >
          Empezar
        </Button>
      </header>

      <section className="mx-auto grid max-w-[1440px] gap-12 px-5 pb-16 pt-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.75fr)] lg:items-center lg:px-10 lg:pb-24 lg:pt-20">
        <div className="max-w-3xl">
          <Chip
            className="mb-7 w-fit border border-[#b8dcd6] bg-[#e5f3f0] text-[#0d6963]"
            startContent={<Sparkles size={15} />}
            variant="flat"
          >
            Agenda clara para negocios ocupados
          </Chip>
          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.04] tracking-[-0.04em] sm:text-7xl">
            Tu negocio se ve bien. Tu agenda también.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-[#68737a]">
            Una página de reservas profesional y un calendario que te ayuda a
            trabajar con más calma, desde el primer día.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button
              as={Link}
              className="whitespace-nowrap"
              color="primary"
              href="/register"
              size="lg"
              endContent={<ArrowUpRight size={18} />}
            >
              Crear mi espacio
            </Button>
            <Button as={Link} href="/login" size="lg" variant="light">
              Ya tengo una cuenta
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#68737a]">
            <span className="flex items-center gap-2">
              <Check className="text-[#11766f]" size={16} />7 días de prueba
            </span>
            <span className="flex items-center gap-2">
              <Check className="text-[#11766f]" size={16} />
              Página pública incluida
            </span>
            <span className="flex items-center gap-2">
              <Check className="text-[#11766f]" size={16} />
              Sin tarjeta
            </span>
          </div>
        </div>

        <Card
          className="border border-[#dce7e3] bg-white shadow-[0_24px_70px_rgba(23,32,37,0.09)]"
          radius="lg"
        >
          <CardBody className="p-0">
            <div className="flex items-center justify-between border-b border-[#edf1ef] px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#11766f]">
                  Hoy, martes 18
                </p>
                <h2 className="mt-1 text-xl font-semibold">Tu agenda</h2>
              </div>
              <Button
                isIconOnly
                aria-label="Abrir agenda"
                className="text-[#11766f]"
                variant="flat"
              >
                <CalendarDays size={19} />
              </Button>
            </div>
            <div className="space-y-3 p-6">
              <div className="flex items-center justify-between text-sm text-[#68737a]">
                <span>3 reservas confirmadas</span>
                <span className="flex items-center gap-1.5">
                  <Clock3 size={15} />
                  7h 30m
                </span>
              </div>
              <Divider />
              {appointments.map((appointment) => (
                <div
                  className="flex items-center gap-3 rounded-xl border border-[#edf1ef] p-3"
                  key={appointment.time}
                >
                  <div
                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-[#11766f] ${appointment.tone}`}
                  >
                    {appointment.time}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{appointment.name}</p>
                    <p className="truncate text-sm text-[#68737a]">
                      {appointment.service}
                    </p>
                  </div>
                  <span className="ml-auto size-2 rounded-full bg-[#56a79c]" />
                </div>
              ))}
              <Button
                as={Link}
                className="mt-2 w-full"
                href="/register"
                variant="flat"
                endContent={<ArrowUpRight size={16} />}
              >
                Ver cómo funciona
              </Button>
            </div>
          </CardBody>
        </Card>
      </section>

      <section className="border-y border-[#e3eae6] bg-white" id="herramientas">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-5 py-12 md:grid-cols-3 lg:px-10">
          {[
            [
              "01",
              "Página que habla por ti",
              "Presenta tus servicios, tu equipo y tus horarios con una landing que sí se siente tuya.",
            ],
            [
              "02",
              "Reservas sin mensajes eternos",
              "Tus clientes eligen servicio y horario. Tú recibes todo ordenado en un solo lugar.",
            ],
            [
              "03",
              "Más control, menos pendientes",
              "Conecta Google Calendar, gestiona tu equipo y mira el día completo de un vistazo.",
            ],
          ].map(([number, title, description]) => (
            <div className="space-y-3" key={number}>
              <p className="text-sm font-semibold text-[#e47758]">{number}</p>
              <h2 className="text-xl font-semibold">{title}</h2>
              <p className="max-w-sm leading-7 text-[#68737a]">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        className="mx-auto max-w-[1440px] px-5 py-16 lg:px-10"
        id="como-funciona"
      >
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#11766f]">
              Listo para usar
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              Empieza pequeño. Organiza todo desde aquí.
            </h2>
          </div>
          <Button
            as={Link}
            color="primary"
            href="/register"
            endContent={<ArrowUpRight size={16} />}
          >
            Crear mi negocio
          </Button>
        </div>
      </section>
    </main>
  );
}

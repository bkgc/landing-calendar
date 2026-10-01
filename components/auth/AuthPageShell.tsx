"use client";

import { ArrowUpRight, Check, Sparkles } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/icons";
import { Button, Card, CardBody, Chip } from "@/components/ui";

interface AuthPageShellProps {
  children: React.ReactNode;
  subtitle: string;
  title: string;
}

export function AuthPageShell({
  children,
  subtitle,
  title,
}: AuthPageShellProps) {
  return (
    <main className="min-h-screen bg-[var(--app-canvas)] px-5 py-6 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center justify-center">
        <Card
          className="w-full overflow-hidden border border-[var(--app-line)] bg-white shadow-[0_24px_70px_rgba(23,32,37,0.08)]"
          radius="lg"
        >
          <CardBody className="grid p-0 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="hidden flex-col justify-between bg-[#172025] p-10 text-white lg:flex">
              <Link className="flex items-center gap-3 font-semibold" href="/">
                <span className="flex size-9 items-center justify-center rounded-xl bg-[#11766f]">
                  <Logo size={23} />
                </span>
                AgendaPro
              </Link>
              <div className="space-y-6">
                <Chip
                  className="border border-white/15 bg-white/10 text-[#a6d8d0]"
                  startContent={<Sparkles size={14} />}
                  variant="flat"
                >
                  Tu agenda, más simple
                </Chip>
                <div>
                  <p className="max-w-sm text-4xl font-semibold leading-tight tracking-[-0.03em]">
                    Tu negocio listo para recibir reservas.
                  </p>
                  <p className="mt-5 max-w-sm leading-7 text-white/65">
                    Presenta tus servicios, organiza tus horarios y deja que tus
                    clientes reserven online.
                  </p>
                </div>
                <div className="space-y-3 text-sm text-white/75">
                  <p className="flex items-center gap-2">
                    <Check className="text-[#a6d8d0]" size={16} />
                    Página pública personalizable
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="text-[#a6d8d0]" size={16} />
                    Agenda conectada con Google Calendar
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="text-[#a6d8d0]" size={16} />
                    Prueba gratuita de 7 días
                  </p>
                </div>
              </div>
              <p className="text-sm text-white/45">
                Hecho para negocios de servicios.
              </p>
            </div>
            <div className="p-6 sm:p-10 lg:p-14">
              <div className="mb-10 flex items-center justify-between lg:mb-12">
                <Link
                  className="flex items-center gap-2 font-semibold lg:hidden"
                  href="/"
                >
                  <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--app-primary)] text-white">
                    <Logo size={19} />
                  </span>
                  AgendaPro
                </Link>
                <Button
                  as={Link}
                  className="ml-auto text-[var(--app-muted)]"
                  href="/"
                  endContent={<ArrowUpRight size={15} />}
                  size="sm"
                  variant="light"
                >
                  Volver al inicio
                </Button>
              </div>
              <div className="mb-8 space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--app-primary)]">
                  AgendaPro
                </p>
                <h1 className="text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
                  {title}
                </h1>
                <p className="text-[var(--app-muted)]">{subtitle}</p>
              </div>
              {children}
            </div>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}

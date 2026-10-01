"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

import { Button, Card, CardBody, Chip } from "@/components/ui";
import { landingAnimationClass } from "@/components/builder/blocks/animation";
import type { CallToActionBlockProps } from "@/types/blocks";

export function CallToActionBlock({
  badgeText = "RESERVA RÁPIDA",
  title = "¿Listo para agendar tu cita?",
  subtitle = "Encuentra el horario perfecto y asegura tu lugar hoy mismo sin esperas.",
  ctaText = "Reservar ahora",
  ctaHref = "#reservar",
  secondaryCtaText,
  secondaryCtaHref,
  backgroundStyle = "primary",
  align = "center",
  buttonLayout = "row",
  animation = "fade_up",
}: CallToActionBlockProps) {
  const isPrimary = backgroundStyle === "primary";
  const isDark = backgroundStyle === "dark";
  const isCentered = align === "center";

  const cardBgClass = isPrimary
    ? "bg-[var(--landing-primary)] text-white shadow-xl shadow-[var(--landing-primary)]/20"
    : isDark
      ? "bg-[#172025] text-white shadow-xl shadow-black/20"
      : "bg-white/80 border border-black/10 text-inherit shadow-md";

  return (
    <section className="border-b border-black/10 px-5 py-16 md:py-24 lg:px-8">
      <div className={`mx-auto max-w-[1280px] ${landingAnimationClass(animation)}`}>
        <Card className={`overflow-hidden border-0 ${cardBgClass}`} radius="lg">
          <CardBody className={`relative p-8 sm:p-12 md:p-16 ${isCentered ? "text-center" : "text-left"}`}>
            {/* Elemento decorativo sutil de fondo */}
            <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 size-72 rounded-full bg-white/10 blur-3xl" />

            <div className={`relative ${isCentered ? "mx-auto max-w-2xl" : "max-w-2xl"} space-y-4`}>
              {badgeText ? (
                <Chip
                  className={
                    isPrimary || isDark
                      ? "border border-white/20 bg-white/15 text-white font-semibold tracking-wider text-xs"
                      : "border border-[var(--landing-primary)]/20 bg-[var(--landing-primary)]/10 text-[var(--landing-primary)] font-semibold tracking-wider text-xs"
                  }
                  size="sm"
                  startContent={<Sparkles size={13} />}
                  variant="flat"
                >
                  {badgeText}
                </Chip>
              ) : null}

              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
                {title}
              </h2>

              {subtitle ? (
                <p
                  className={`text-base sm:text-lg leading-relaxed ${
                    isPrimary || isDark ? "text-white/80" : "opacity-75"
                  }`}
                >
                  {subtitle}
                </p>
              ) : null}

              <div
                className={`pt-4 flex flex-wrap gap-4 ${
                  buttonLayout === "column"
                    ? `flex-col ${isCentered ? "items-center" : "items-start"}`
                    : `items-center ${isCentered ? "justify-center" : "justify-start"}`
                }`}
              >
                <Button
                  as={Link}
                  href={ctaHref || "#reservar"}
                  size="lg"
                  className={
                    isPrimary || isDark
                      ? "bg-white text-[#172025] font-semibold shadow-md hover:scale-105 transition-all duration-200"
                      : "bg-[var(--landing-primary)] text-white font-semibold shadow-md hover:scale-105 transition-all duration-200"
                  }
                  endContent={<ArrowRight size={18} />}
                >
                  {ctaText}
                </Button>

                {secondaryCtaText && secondaryCtaHref ? (
                  <Button
                    as={Link}
                    href={secondaryCtaHref}
                    size="lg"
                    variant="bordered"
                    className={
                      isPrimary || isDark
                        ? "border-white/30 text-white hover:bg-white/10"
                        : "border-black/20 text-inherit hover:bg-black/5"
                    }
                  >
                    {secondaryCtaText}
                  </Button>
                ) : null}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </section>
  );
}

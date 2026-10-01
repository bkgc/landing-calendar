import { ArrowUpRight, CalendarDays, Clock3 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button, Card, CardBody, Chip, Divider } from "@/components/ui";
import type { HeroBlockProps } from "@/types/blocks";
import type { Business } from "@/types/business";

import { landingAnimationClass } from "./animation";

export function HeroBlock({
  business,
  title,
  subtitle,
  ctaText,
  imageUrl,
  ctaHref = "#reservar",
  secondaryCtaText,
  secondaryCtaHref = "#servicios",
  badgeText,
  layout = "split",
  imagePosition = "right",
  align = "left",
  textAnimation = "fade_up",
  imageAnimation = "zoom_in",
}: HeroBlockProps & { business: Business }) {
  const background = layout === "image_background" && imageUrl;
  const centered = layout === "centered" || align === "center";
  const displayBadge = badgeText || business.name;

  return (
    <section
      className={`relative overflow-hidden border-b border-black/10 px-5 py-16 md:py-24 lg:px-8 ${background ? "text-white" : ""}`}
      id="inicio"
    >
      {background ? (
        <>
          <Image
            fill
            unoptimized
            alt=""
            className={`object-cover ${landingAnimationClass(imageAnimation)}`}
            sizes="100vw"
            src={imageUrl}
          />
          <div className="absolute inset-0 bg-black/55" />
        </>
      ) : null}
      <div
        className={`relative mx-auto grid max-w-[1280px] items-center gap-12 ${
          centered
            ? "max-w-4xl text-center"
            : `lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.75fr)] ${
                imagePosition === "left" ? "lg:[&>div:first-child]:order-2" : ""
              }`
        }`}
      >
        <div
          className={`${
            centered
              ? "mx-auto max-w-3xl text-center"
              : align === "right"
                ? "ml-auto max-w-3xl text-right"
                : "max-w-3xl text-left"
          } ${landingAnimationClass(textAnimation)}`}
        >
          {displayBadge ? (
            <Chip
              className={`mb-7 w-fit ${
                centered ? "mx-auto" : align === "right" ? "ml-auto" : ""
              } border border-[var(--landing-primary)]/20 bg-[var(--landing-primary)]/10 text-[var(--landing-primary)]`}
              color="primary"
              variant="flat"
            >
              {displayBadge}
            </Chip>
          ) : null}
          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.04] tracking-[-0.04em] sm:text-7xl">
            {title}
          </h1>
          {subtitle ? (
            <p
              className={`mt-7 max-w-xl text-lg leading-8 opacity-70 ${
                centered ? "mx-auto" : align === "right" ? "ml-auto" : ""
              }`}
            >
              {subtitle}
            </p>
          ) : null}
          <div
            className={`mt-9 flex flex-wrap items-center gap-3 ${
              centered
                ? "justify-center"
                : align === "right"
                  ? "justify-end"
                  : "justify-start"
            }`}
          >
            <Button
              as={Link}
              className="whitespace-nowrap"
              color="primary"
              endContent={<ArrowUpRight size={18} />}
              href={ctaHref}
              size="lg"
            >
              {ctaText}
            </Button>
            {secondaryCtaText ? (
              <Button
                as={Link}
                className="whitespace-nowrap"
                variant="flat"
                href={secondaryCtaHref}
                size="lg"
              >
                {secondaryCtaText}
              </Button>
            ) : null}
          </div>
        </div>
        {!centered && !background ? (
          imageUrl ? (
            <div
              className={`relative aspect-[4/3] w-full overflow-hidden rounded-[var(--landing-radius)] ${landingAnimationClass(imageAnimation)}`}
            >
              <Image
                fill
                unoptimized
                alt=""
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 45vw"
                src={imageUrl}
              />
            </div>
          ) : (
            <div className={landingAnimationClass(imageAnimation)}>
              <BookingHint ctaHref={ctaHref} />
            </div>
          )
        ) : null}
      </div>
    </section>
  );
}

function BookingHint({ ctaHref }: { ctaHref: string }) {
  return (
    <Card
      className="border border-black/10 bg-black/[0.02] shadow-none"
      radius="lg"
    >
      <CardBody className="gap-5 p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--landing-primary)]">
              Agenda online
            </p>
            <p className="mt-1 text-xl font-semibold">Reserva en pocos pasos</p>
          </div>
          <span className="flex size-10 items-center justify-center rounded-xl bg-[var(--landing-primary)]/10 text-[var(--landing-primary)]">
            <CalendarDays size={19} />
          </span>
        </div>
        <Divider />
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-black/10 bg-white/70 p-4">
            <span className="text-sm opacity-70">Servicio</span>
            <span className="font-medium">Elige tu favorito</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-black/10 bg-white/70 p-4">
            <span className="text-sm opacity-70">Horario</span>
            <span className="flex items-center gap-2 font-medium">
              <Clock3 size={16} />A tu ritmo
            </span>
          </div>
        </div>
        <Button as={Link} className="w-full" color="primary" href={ctaHref}>
          Ver horarios disponibles
        </Button>
      </CardBody>
    </Card>
  );
}

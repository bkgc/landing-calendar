"use client";

import {
  Award,
  CheckCircle,
  Clock,
  Heart,
  Shield,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";

import { Card, CardBody, Chip } from "@/components/ui";
import { landingAnimationClass } from "@/components/builder/blocks/animation";
import type { FeaturesBlockProps } from "@/types/blocks";

const iconMap: Record<string, typeof Sparkles> = {
  sparkles: Sparkles,
  shield: Shield,
  clock: Clock,
  heart: Heart,
  award: Award,
  star: Star,
  zap: Zap,
  check: CheckCircle,
};

export function FeaturesBlock({
  eyebrow,
  title = "Por qué elegirnos",
  subtitle = "Calidad y dedicación en cada detalle.",
  columns = 3,
  items = [],
  align = "center",
  animation = "fade_up",
}: FeaturesBlockProps) {
  if (!items.length) return null;

  const isCentered = align === "center";

  const gridColsClass =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 4
        ? "sm:grid-cols-2 lg:grid-cols-4"
        : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section className="border-b border-black/10 px-5 py-16 md:py-24 lg:px-8">
      <div className={`mx-auto max-w-[1280px] ${landingAnimationClass(animation)}`}>
        <div className={`max-w-2xl ${isCentered ? "mx-auto text-center" : "text-left"}`}>
          {eyebrow ? (
            <Chip
              className={`border border-[var(--landing-primary)]/20 bg-[var(--landing-primary)]/10 text-[var(--landing-primary)] font-semibold text-xs tracking-wider uppercase mb-4 ${
                isCentered ? "mx-auto" : ""
              }`}
              size="sm"
              variant="flat"
            >
              {eyebrow}
            </Chip>
          ) : null}
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-3 text-base leading-relaxed opacity-70">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className={`mt-12 grid gap-6 ${gridColsClass}`}>
          {items.map((item) => {
            const IconComponent = iconMap[item.icon] || Sparkles;
            return (
              <Card
                key={item.id}
                className="group relative overflow-hidden border border-black/10 bg-white/70 backdrop-blur-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--landing-primary)] hover:shadow-lg shadow-xs"
                radius="lg"
              >
                <CardBody className="p-7">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--landing-primary)]/10 text-[var(--landing-primary)] transition-transform duration-300 group-hover:scale-110">
                    <IconComponent size={24} />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed opacity-70">
                    {item.description}
                  </p>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

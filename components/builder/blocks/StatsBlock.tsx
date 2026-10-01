"use client";

import { Card, CardBody } from "@/components/ui";
import { landingAnimationClass } from "@/components/builder/blocks/animation";
import type { StatsBlockProps } from "@/types/blocks";

export function StatsBlock({
  title,
  subtitle,
  columns = 4,
  items = [],
  align = "center",
  animation = "fade_up",
}: StatsBlockProps) {
  if (!items.length) return null;

  const isCentered = align === "center";
  const gridColsClass =
    columns === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : columns === 3
        ? "grid-cols-1 sm:grid-cols-3"
        : "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4";

  return (
    <section className="border-b border-black/10 px-5 py-14 md:py-20 lg:px-8">
      <div className={`mx-auto max-w-[1280px] ${landingAnimationClass(animation)}`}>
        {title ? (
          <div className={`mb-10 max-w-2xl ${isCentered ? "mx-auto text-center" : "text-left"}`}>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-2 text-sm leading-relaxed opacity-70">
                {subtitle}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className={`grid gap-4 ${gridColsClass}`}>
          {items.map((stat) => (
            <Card
              key={stat.id}
              className="border border-black/10 bg-white/60 text-center shadow-xs transition-transform duration-300 hover:scale-105"
              radius="lg"
            >
              <CardBody className="p-6 sm:p-8">
                <p className="text-3xl font-extrabold tracking-tight text-[var(--landing-primary)] sm:text-4xl">
                  {stat.value}
                  {stat.suffix ? (
                    <span className="text-2xl font-bold ml-0.5">{stat.suffix}</span>
                  ) : null}
                </p>
                <p className="mt-2 text-sm font-medium opacity-75">
                  {stat.label}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

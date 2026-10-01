"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui";
import type { ImageCarouselBlockProps } from "@/types/blocks";

import { landingAnimationClass } from "./animation";

export function ImageCarouselBlock({
  title = "Conoce nuestro espacio",
  subtitle,
  images = [],
  interval = 4500,
  autoplay = true,
  transition = "fade",
  animation = "fade_up",
}: ImageCarouselBlockProps) {
  const [active, setActive] = useState(0);
  const current = images[active];

  useEffect(() => {
    if (!autoplay || images.length < 2) return;
    const timer = window.setInterval(
      () => {
        setActive((value) => (value + 1) % images.length);
      },
      Math.max(1500, interval),
    );
    return () => window.clearInterval(timer);
  }, [autoplay, images.length, interval]);

  if (!images.length || !current?.url) return null;
  const visualClass =
    transition === "ken_burns"
      ? "landing-carousel-ken-burns"
      : transition === "slide"
        ? "landing-carousel-slide"
        : "landing-carousel-fade";

  return (
    <section
      className={`space-y-6 px-5 py-16 lg:px-8 ${landingAnimationClass(animation)}`}
    >
      <div className="mx-auto flex max-w-[1280px] items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--landing-primary)]">
            Galería
          </p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">{title}</h2>
          {subtitle ? (
            <p className="mt-3 max-w-2xl leading-7 opacity-70">{subtitle}</p>
          ) : null}
        </div>
        {images.length > 1 ? (
          <div className="flex gap-2">
            <Button
              isIconOnly
              aria-label="Imagen anterior"
              size="sm"
              variant="flat"
              onPress={() =>
                setActive(
                  (value) => (value - 1 + images.length) % images.length,
                )
              }
            >
              <ArrowLeft size={16} />
            </Button>
            <Button
              isIconOnly
              aria-label="Siguiente imagen"
              size="sm"
              variant="flat"
              onPress={() => setActive((value) => (value + 1) % images.length)}
            >
              <ArrowRight size={16} />
            </Button>
          </div>
        ) : null}
      </div>
      <div className="mx-auto max-w-[1280px]">
        <div className="relative aspect-[16/8] overflow-hidden rounded-[var(--landing-radius)] bg-black/5">
          <Image
            key={current.url}
            fill
            unoptimized
            alt={current.alt}
            className={`object-cover ${visualClass}`}
            sizes="(max-width: 768px) 100vw, 1280px"
            src={current.url}
          />
        </div>
        {images.length > 1 ? (
          <div
            className="mt-4 flex justify-center gap-2"
            role="tablist"
            aria-label="Imágenes de la galería"
          >
            {images.map((image, index) => (
              <button
                key={`${image.url}-${index}`}
                aria-label={`Mostrar imagen ${index + 1}`}
                aria-pressed={index === active}
                className={`h-2 rounded-full transition-all ${index === active ? "w-8 bg-[var(--landing-primary)]" : "w-2 bg-black/20"}`}
                type="button"
                onClick={() => setActive(index)}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

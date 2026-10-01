"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef } from "react";

import { Avatar, Button, Card, CardBody } from "@/components/ui";
import type { TestimonialsBlockProps } from "@/types/blocks";

export function TestimonialsBlock({
  title = "Lo que dicen nuestros clientes",
  testimonials = [],
}: TestimonialsBlockProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  if (!testimonials.length) return null;

  const scroll = (direction: -1 | 1) => {
    trackRef.current?.scrollBy({ left: direction * 360, behavior: "smooth" });
  };

  return (
    <section className="space-y-6 px-5 py-16 lg:px-8">
      <div className="mx-auto flex max-w-[1280px] items-end justify-between gap-4">
        <h2 className="text-3xl font-bold">{title}</h2>
        {testimonials.length > 1 ? (
          <div className="flex gap-2">
            <Button
              isIconOnly
              aria-label="Testimonios anteriores"
              size="sm"
              variant="flat"
              onPress={() => scroll(-1)}
            >
              <ArrowLeft size={16} />
            </Button>
            <Button
              isIconOnly
              aria-label="Siguientes testimonios"
              size="sm"
              variant="flat"
              onPress={() => scroll(1)}
            >
              <ArrowRight size={16} />
            </Button>
          </div>
        ) : null}
      </div>
      <div
        ref={trackRef}
        className="mx-auto flex max-w-[1280px] snap-x gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {testimonials.map((item) => (
          <Card
            key={`${item.name}-${item.quote}`}
            className="min-w-[min(330px,calc(100vw-3rem))] snap-start border border-black/10 shadow-none"
          >
            <CardBody className="gap-5 p-5">
              <p className="text-base leading-7">“{item.quote}”</p>
              <div className="flex items-center gap-3">
                <Avatar name={item.name} src={item.avatar} />
                <div>
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-sm text-warning">
                    {"★".repeat(Math.min(5, Math.max(1, item.stars)))}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </section>
  );
}

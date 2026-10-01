import Image from "next/image";
import Link from "next/link";

import { ArrowUpRight } from "lucide-react";

import { Button, Card, CardBody } from "@/components/ui";
import type { ContainerBlockProps, LandingElement } from "@/types/blocks";

import { landingAnimationClass } from "./animation";

export function ContainerBlock({
  eyebrow,
  title,
  subtitle,
  layout = "split",
  align = "left",
  background,
  padding = "lg",
  elements = [],
  editorMode = false,
}: ContainerBlockProps & { editorMode?: boolean }) {
  const paddingClass =
    padding === "sm" ? "py-10" : padding === "md" ? "py-16" : "py-24";
  const layoutClass =
    layout === "grid"
      ? "md:grid-cols-2 lg:grid-cols-3"
      : layout === "split"
        ? "md:grid-cols-2"
        : "grid-cols-1";
  const visibleElements = editorMode
    ? elements
    : elements.filter((element) => element.type !== "image" || element.url);

  return (
    <section
      className={`px-5 lg:px-8 ${paddingClass}`}
      style={background ? { backgroundColor: background } : undefined}
    >
      <div
        className={`mx-auto max-w-[1280px] space-y-8 ${align === "center" ? "text-center" : ""}`}
      >
        {eyebrow || title || subtitle ? (
          <div
            className={align === "center" ? "mx-auto max-w-3xl" : "max-w-3xl"}
          >
            {eyebrow ? (
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--landing-primary)]">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p className="mt-3 text-base leading-7 opacity-70">{subtitle}</p>
            ) : null}
          </div>
        ) : null}
        <div className={`grid gap-5 ${layoutClass}`}>
          {visibleElements.map((element) => (
            <ElementView key={element.id} element={element} align={align} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ElementView({
  element,
  align,
}: {
  element: LandingElement;
  align: ContainerBlockProps["align"];
}) {
  const className = landingAnimationClass(element.animation);
  if (element.type === "image") {
    return element.url ? (
      <div
        className={`${className} relative aspect-[4/3] min-h-48 overflow-hidden rounded-[var(--landing-radius)]`}
      >
        <Image
          fill
          unoptimized
          alt={element.alt || ""}
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          src={element.url}
        />
      </div>
    ) : (
      <div
        className={`${className} flex aspect-[4/3] min-h-48 items-center justify-center rounded-[var(--landing-radius)] border border-dashed border-[var(--landing-primary)]/30 bg-[var(--landing-primary)]/5 p-6 text-sm opacity-70`}
      >
        Añade una imagen desde el panel.
      </div>
    );
  }

  if (element.type === "button") {
    return (
      <div className={className}>
        <Button
          as={Link}
          color="primary"
          endContent={<ArrowUpRight size={16} />}
          href={element.href || "#reservar"}
        >
          {element.label || element.title || "Conocer más"}
        </Button>
      </div>
    );
  }

  if (element.type === "stat") {
    return (
      <Card className={`${className} border border-black/10 shadow-none`}>
        <CardBody
          className={`gap-1 p-5 ${align === "center" ? "items-center" : ""}`}
        >
          <p className="text-3xl font-semibold text-[var(--landing-primary)]">
            {element.value || "0"}
          </p>
          <p className="text-sm opacity-70">
            {element.label || element.title || "Dato destacado"}
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div
      className={`${className} space-y-3 ${align === "center" ? "mx-auto max-w-xl" : ""}`}
    >
      {element.eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--landing-primary)]">
          {element.eyebrow}
        </p>
      ) : null}
      {element.title ? (
        <h3 className="text-2xl font-semibold">{element.title}</h3>
      ) : null}
      {element.body ? (
        <p className="whitespace-pre-line leading-7 opacity-70">
          {element.body}
        </p>
      ) : null}
    </div>
  );
}

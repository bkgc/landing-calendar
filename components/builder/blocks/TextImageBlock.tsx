import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Button, Chip } from "@/components/ui";
import type { TextImageBlockProps } from "@/types/blocks";

import { landingAnimationClass } from "./animation";

export function TextImageBlock({
  title,
  text,
  imageUrl,
  imagePosition = "right",
  badgeText,
  ctaText,
  ctaHref = "#reservar",
  align = "left",
  textAnimation = "fade_up",
  imageAnimation = "slide_left",
}: TextImageBlockProps) {
  const isCentered = align === "center";

  return (
    <section
      className={`grid items-center gap-10 px-5 py-16 md:grid-cols-2 ${
        imagePosition === "left" ? "md:[&>div:first-child]:order-2" : ""
      }`}
    >
      <div
        className={`space-y-4 ${
          isCentered ? "text-center mx-auto" : "text-left"
        } ${landingAnimationClass(textAnimation)}`}
      >
        {badgeText ? (
          <Chip
            className={`border border-[var(--landing-primary)]/20 bg-[var(--landing-primary)]/10 text-[var(--landing-primary)] font-semibold text-xs tracking-wider uppercase ${
              isCentered ? "mx-auto" : ""
            }`}
            size="sm"
            variant="flat"
          >
            {badgeText}
          </Chip>
        ) : null}
        <h2 className="text-3xl font-bold">{title}</h2>
        <p className="whitespace-pre-line opacity-75">{text}</p>
        {ctaText ? (
          <div className={`pt-2 ${isCentered ? "flex justify-center" : ""}`}>
            <Button
              as={Link}
              color="primary"
              endContent={<ArrowUpRight size={16} />}
              href={ctaHref}
            >
              {ctaText}
            </Button>
          </div>
        ) : null}
      </div>
      {imageUrl ? (
        <div
          className={`relative aspect-[4/3] w-full overflow-hidden rounded-2xl ${landingAnimationClass(imageAnimation)}`}
        >
          <Image
            fill
            unoptimized
            alt=""
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            src={imageUrl}
          />
        </div>
      ) : (
        <div
          className={`aspect-[4/3] rounded-2xl bg-[var(--landing-primary)]/10 ${landingAnimationClass(imageAnimation)}`}
        />
      )}
    </section>
  );
}

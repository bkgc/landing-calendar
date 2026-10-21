"use client";

import type { Business, BusinessHours } from "@/types/business";
import {
  BLOCK_LABELS,
  type BookingCalendarBlockProps,
  type ContainerBlockProps,
  type FaqBlockProps,
  type FooterBlockProps,
  type GalleryBlockProps,
  type HeroBlockProps,
  type ImageCarouselBlockProps,
  type LandingBlock,
  type LandingConfig,
  type MapContactBlockProps,
  type NavbarBlockProps,
  type ServicesBlockProps,
  type StaffBlockProps,
  type TestimonialsBlockProps,
  type TextImageBlockProps,
  type VideoEmbedBlockProps,
  type FeaturesBlockProps,
  type StatsBlockProps,
  type CallToActionBlockProps,
  type LandingAnimation,
} from "@/types/blocks";
import type { Service } from "@/types/service";
import type { StaffMember } from "@/types/staff";

import { landingAnimationClass } from "./blocks/animation";

import { BookingCalendarBlock } from "./blocks/BookingCalendarBlock";
import { FaqBlock } from "./blocks/FaqBlock";
import { FooterBlock } from "./blocks/FooterBlock";
import { GalleryBlock } from "./blocks/GalleryBlock";
import { HeroBlock } from "./blocks/HeroBlock";
import { ImageCarouselBlock } from "./blocks/ImageCarouselBlock";
import { MapContactBlock } from "./blocks/MapContactBlock";
import { NavbarBlock } from "./blocks/NavbarBlock";
import { ServicesBlock } from "./blocks/ServicesBlock";
import { StaffBlock } from "./blocks/StaffBlock";
import { TestimonialsBlock } from "./blocks/TestimonialsBlock";
import { TextImageBlock } from "./blocks/TextImageBlock";
import { VideoEmbedBlock } from "./blocks/VideoEmbedBlock";
import { ContainerBlock } from "./blocks/ContainerBlock";
import { FeaturesBlock } from "./blocks/FeaturesBlock";
import { StatsBlock } from "./blocks/StatsBlock";
import { CallToActionBlock } from "./blocks/CallToActionBlock";

export interface BlockRendererProps {
  business: Business;
  config: LandingConfig;
  services: Service[];
  staff: StaffMember[];
  businessHours?: BusinessHours;
  preview?: boolean;
  editorMode?: boolean;
}

export function BlockRenderer({
  business,
  config,
  services,
  staff,
  businessHours,
  preview = false,
  editorMode = false,
}: BlockRendererProps) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col">
      {config.blocks.map((block) => (
        <BlockView
          key={block.id}
          block={block}
          business={business}
          services={services}
          staff={staff}
          businessHours={businessHours}
          preview={preview}
          editorMode={editorMode}
        />
      ))}
    </div>
  );
}

export function BlockView({
  block,
  business,
  services,
  staff,
  businessHours,
  preview,
  editorMode,
}: {
  block: LandingBlock;
  business: Business;
  services: Service[];
  staff: StaffMember[];
  businessHours?: BusinessHours;
  preview: boolean;
  editorMode: boolean;
}) {
  if (editorMode && isEmptyBlock(block, services, staff)) {
    return <EditorBlockPlaceholder type={block.type} />;
  }

  const content = renderBlockContent({
    block,
    business,
    services,
    staff,
    businessHours,
    preview,
    editorMode,
  });

  if (!content) return null;
  return <BlockWrapper block={block}>{content}</BlockWrapper>;
}

function BlockWrapper({
  block,
  children,
}: {
  block: LandingBlock;
  children: React.ReactNode;
}) {
  const props = block.props as Record<string, unknown>;
  const bgType = (props.bgType as string) || "default";
  const bgColor = props.bgColor as string | undefined;
  const bgGradient = props.bgGradient as string | undefined;
  const bgImageUrl = props.bgImageUrl as string | undefined;
  const bgOverlayOpacity =
    typeof props.bgOverlayOpacity === "number" ? props.bgOverlayOpacity : 50;
  const textColor = props.textColor as string | undefined;
  const animation = (props.animation as LandingAnimation) || "none";
  const animClass = landingAnimationClass(animation);

  const align = props.align as string | undefined;
  const padding = props.padding as string | undefined;

  if (
    bgType === "default" &&
    !textColor &&
    animation === "none" &&
    !align &&
    !padding
  ) {
    return <>{children}</>;
  }

  const containerStyle: React.CSSProperties = {};
  if (bgType === "solid" && bgColor) {
    containerStyle.backgroundColor = bgColor;
  } else if (bgType === "gradient" && bgGradient) {
    containerStyle.backgroundImage = bgGradient;
  }

  const textClass =
    textColor === "light"
      ? "text-white [&_*]:text-inherit"
      : textColor === "dark"
        ? "text-slate-900 [&_*]:text-inherit"
        : "";

  const paddingClass =
    padding === "none"
      ? "[&>section]:!py-0"
      : padding === "sm"
        ? "[&>section]:!py-8"
        : padding === "lg"
          ? "[&>section]:!py-24 md:[&>section]:!py-28"
          : padding === "xl"
            ? "[&>section]:!py-32 md:[&>section]:!py-40"
            : "";

  const alignClass =
    align === "center"
      ? "[&>section]:text-center"
      : align === "right"
        ? "[&>section]:text-right"
        : "";

  return (
    <div
      className={`relative overflow-hidden transition-colors ${animClass} ${textClass} ${paddingClass} ${alignClass}`}
      style={containerStyle}
    >
      {bgType === "image" && bgImageUrl ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${bgImageUrl})` }}
          />
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: bgOverlayOpacity / 100 }}
          />
        </>
      ) : null}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function renderBlockContent({
  block,
  business,
  services,
  staff,
  businessHours,
  preview,
  editorMode,
}: {
  block: LandingBlock;
  business: Business;
  services: Service[];
  staff: StaffMember[];
  businessHours?: BusinessHours;
  preview: boolean;
  editorMode: boolean;
}) {
  switch (block.type) {
    case "navbar":
      return (
        <NavbarBlock
          business={business}
          {...(block.props as unknown as NavbarBlockProps)}
        />
      );
    case "hero":
      return (
        <HeroBlock
          business={business}
          {...(block.props as unknown as HeroBlockProps)}
        />
      );
    case "services":
      return (
        <ServicesBlock
          services={services}
          {...(block.props as unknown as ServicesBlockProps)}
        />
      );
    case "booking_calendar":
      return (
        <BookingCalendarBlock
          businessId={business.id}
          businessWhatsapp={business.whatsapp}
          services={services}
          staff={staff}
          businessHours={businessHours}
          preview={preview || editorMode}
          {...(block.props as unknown as BookingCalendarBlockProps)}
        />
      );
    case "gallery":
      return (
        <GalleryBlock {...(block.props as unknown as GalleryBlockProps)} />
      );
    case "video_embed":
      return (
        <VideoEmbedBlock
          {...(block.props as unknown as VideoEmbedBlockProps)}
        />
      );
    case "staff":
      return (
        <StaffBlock
          staff={staff}
          {...(block.props as unknown as StaffBlockProps)}
        />
      );
    case "testimonials":
      return (
        <TestimonialsBlock
          {...(block.props as unknown as TestimonialsBlockProps)}
        />
      );
    case "text_image":
      return (
        <TextImageBlock {...(block.props as unknown as TextImageBlockProps)} />
      );
    case "faq":
      return <FaqBlock {...(block.props as unknown as FaqBlockProps)} />;
    case "map_contact":
      return (
        <MapContactBlock
          business={business}
          {...(block.props as unknown as MapContactBlockProps)}
        />
      );
    case "footer":
      return (
        <FooterBlock
          business={business}
          {...(block.props as unknown as FooterBlockProps)}
        />
      );
    case "container":
      return (
        <ContainerBlock
          editorMode={editorMode}
          {...(block.props as unknown as ContainerBlockProps)}
        />
      );
    case "image_carousel":
      return (
        <ImageCarouselBlock
          {...(block.props as unknown as ImageCarouselBlockProps)}
        />
      );
    case "features":
      return (
        <FeaturesBlock
          {...(block.props as unknown as FeaturesBlockProps)}
        />
      );
    case "stats":
      return (
        <StatsBlock
          {...(block.props as unknown as StatsBlockProps)}
        />
      );
    case "call_to_action":
      return (
        <CallToActionBlock
          {...(block.props as unknown as CallToActionBlockProps)}
        />
      );
    default:
      return null;
  }
}

function isEmptyBlock(
  block: LandingBlock,
  services: Service[],
  staff: StaffMember[],
) {
  const props = block.props as Record<string, unknown>;
  if (block.type === "gallery")
    return !Array.isArray(props.images) || !props.images.length;
  if (block.type === "video_embed") return !props.url;
  if (block.type === "testimonials")
    return !Array.isArray(props.testimonials) || !props.testimonials.length;
  if (block.type === "faq")
    return !Array.isArray(props.items) || !props.items.length;
  if (block.type === "image_carousel")
    return !Array.isArray(props.images) || !props.images.length;
  if (block.type === "container")
    return !Array.isArray(props.elements) || !props.elements.length;
  if (block.type === "features")
    return !Array.isArray(props.items) || !props.items.length;
  if (block.type === "stats")
    return !Array.isArray(props.items) || !props.items.length;
  if (block.type === "call_to_action")
    return !props.title;
  if (block.type === "services") return !services.length;
  if (block.type === "staff") return !staff.length;
  return false;
}

function EditorBlockPlaceholder({ type }: { type: LandingBlock["type"] }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-2 bg-[var(--app-canvas)] px-6 py-10 text-center">
      <p className="font-semibold">{BLOCK_LABELS[type]}</p>
      <p className="max-w-sm text-sm text-[var(--app-muted)]">
        Este bloque necesita contenido. Selecciónalo y completa sus propiedades.
      </p>
    </div>
  );
}

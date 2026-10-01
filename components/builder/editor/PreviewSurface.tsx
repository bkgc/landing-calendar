"use client";

import { type CSSProperties, useCallback, useEffect, useState } from "react";

import { BlockRenderer } from "@/components/builder/BlockRenderer";
import { getLandingFontStack, type LandingConfig } from "@/types/blocks";
import type { Business } from "@/types/business";
import type { Service } from "@/types/service";
import type { StaffMember } from "@/types/staff";

interface PreviewPayload {
  business: Pick<
    Business,
    "id" | "instagram" | "logoUrl" | "name" | "plan" | "whatsapp"
  >;
  config: LandingConfig;
  services: Service[];
  staff: StaffMember[];
}

function isPreviewPayload(value: unknown): value is PreviewPayload {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<PreviewPayload>;
  return (
    Boolean(candidate.business?.id) &&
    Boolean(candidate.business?.name) &&
    Array.isArray(candidate.config?.blocks) &&
    Array.isArray(candidate.services) &&
    Array.isArray(candidate.staff)
  );
}

function getRadius(radius: LandingConfig["theme"]["radius"]) {
  if (radius === "sm") return "8px";
  if (radius === "md") return "14px";
  if (radius === "full") return "999px";
  return "22px";
}

export function PreviewSurface() {
  const [payload, setPayload] = useState<PreviewPayload | null>(null);

  const postHeight = useCallback(() => {
    const height = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
    );
    window.parent.postMessage(
      { type: "agendapro-editor-preview-height", height },
      window.location.origin,
    );
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (
        event.data?.type === "agendapro-editor-preview-data" &&
        isPreviewPayload(event.data.payload)
      ) {
        setPayload(event.data.payload);
      }
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage(
      { type: "agendapro-editor-preview-ready" },
      window.location.origin,
    );
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    const observer = new ResizeObserver(postHeight);
    observer.observe(document.body);
    postHeight();
    return () => observer.disconnect();
  }, [payload, postHeight]);

  if (!payload) {
    return <main className="min-h-screen bg-white" />;
  }

  const landingStyle = {
    "--landing-primary": payload.config.theme.primary,
    "--landing-background": payload.config.theme.background,
    "--landing-foreground": payload.config.theme.foreground,
    "--landing-font": getLandingFontStack(payload.config.theme.font),
    "--landing-radius": getRadius(payload.config.theme.radius),
  } as CSSProperties;

  return (
    <main
      className="min-h-screen bg-[var(--landing-background)] text-[var(--landing-foreground)] [font-family:var(--landing-font)]"
      style={landingStyle}
    >
      <BlockRenderer
        business={payload.business as Business}
        config={payload.config}
        preview
        services={payload.services}
        staff={payload.staff}
      />
    </main>
  );
}

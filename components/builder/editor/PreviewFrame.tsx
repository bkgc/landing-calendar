"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Spinner } from "@/components/ui";
import type { LandingConfig } from "@/types/blocks";
import type { Business } from "@/types/business";
import type { Service } from "@/types/service";
import type { StaffMember } from "@/types/staff";

type PreviewDevice = "desktop" | "tablet" | "mobile";

interface PreviewFrameProps {
  business: Business;
  config: LandingConfig;
  device: PreviewDevice;
  services: Service[];
  staff: StaffMember[];
}

const previewWidths: Record<PreviewDevice, number> = {
  desktop: 1280,
  tablet: 768,
  mobile: 390,
};

function getFrameClass(device: PreviewDevice) {
  if (device === "mobile")
    return "rounded-[28px] border-[8px] border-[#202a2d] bg-white shadow-[0_18px_40px_rgb(23_32_37_/_18%)]";
  if (device === "tablet")
    return "rounded-[18px] border border-[#cbd8d4] bg-white shadow-[0_12px_28px_rgb(23_32_37_/_10%)]";
  return "border border-[#cbd8d4] bg-white shadow-sm";
}

export function PreviewFrame({
  business,
  config,
  device,
  services,
  staff,
}: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [frameHeight, setFrameHeight] = useState(760);
  const payload = useMemo(
    () => ({
      business: {
        id: business.id,
        instagram: business.instagram,
        logoUrl: business.logoUrl,
        name: business.name,
        plan: business.plan,
        whatsapp: business.whatsapp,
      },
      config: JSON.parse(JSON.stringify(config)) as LandingConfig,
      services: services.map((service) => ({
        active: service.active,
        bufferTime: service.bufferTime,
        businessId: service.businessId,
        description: service.description,
        duration: service.duration,
        id: service.id,
        name: service.name,
        price: service.price,
        staffIds: service.staffIds,
      })),
      staff: staff.map((member) => ({
        active: member.active,
        avatar: member.avatar,
        businessId: member.businessId,
        id: member.id,
        name: member.name,
        role: member.role,
        services: member.services,
      })),
    }),
    [business, config, services, staff],
  );

  const sendPayload = useCallback(() => {
    if (!ready || !iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      { type: "agendapro-editor-preview-data", payload },
      window.location.origin,
    );
  }, [payload, ready]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "agendapro-editor-preview-ready") {
        setReady(true);
      }
      if (
        event.data?.type === "agendapro-editor-preview-height" &&
        typeof event.data.height === "number"
      ) {
        setFrameHeight(Math.min(Math.max(480, event.data.height), 6000));
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    sendPayload();
  }, [sendPayload]);

  return (
    <div className="relative max-h-[calc(100vh-18rem)] overflow-auto rounded-lg bg-[#e7eeeb] p-4">
      <div className="flex min-w-max justify-center">
        <div className={getFrameClass(device)}>
          <iframe
            ref={iframeRef}
            className="block border-0 bg-white"
            height={frameHeight}
            src="/editor-preview"
            style={{ width: previewWidths[device] }}
            title={`Vista previa ${device}`}
          />
        </div>
      </div>
      {!ready ? (
        <div className="absolute inset-0 flex items-center justify-center bg-[#e7eeeb]/80">
          <Spinner label="Preparando vista previa" />
        </div>
      ) : null}
    </div>
  );
}

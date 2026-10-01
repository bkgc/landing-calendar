import { Button } from "@/components/ui";
import type { Business } from "@/types/business";
import type { MapContactBlockProps } from "@/types/blocks";

function isGoogleMapsUrl(value?: string) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      ["google.com", "maps.google.com"].some(
        (host) => url.hostname === host || url.hostname.endsWith(`.${host}`),
      )
    );
  } catch {
    return false;
  }
}

function safeExternalUrl(value?: string) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

export function MapContactBlock({
  business,
  title = "Encuéntranos",
  address,
  mapUrl,
  whatsapp,
  instagram,
  layout = "split",
  align = "left",
}: MapContactBlockProps & { business: Business }) {
  const isCentered = align === "center";
  const isStacked = layout === "stacked";
  const isMapFirst = layout === "map_first";

  return (
    <section
      className={`grid gap-8 px-5 py-16 ${
        isStacked
          ? "grid-cols-1 max-w-4xl mx-auto"
          : `md:grid-cols-2 ${isMapFirst ? "md:[&>div:first-child]:order-2" : ""}`
      }`}
    >
      <div className={`space-y-4 ${isCentered ? "text-center mx-auto" : "text-left"}`}>
        <h2 className="text-3xl font-bold">{title}</h2>
        {address ? <p className="opacity-75">{address}</p> : null}
        <div className={`flex flex-wrap gap-3 ${isCentered ? "justify-center" : ""}`}>
          {whatsapp || business.whatsapp ? (
            <Button
              as="a"
              color="primary"
              href={`https://wa.me/${(whatsapp || business.whatsapp || "").replace(/\D/g, "")}`}
              target="_blank"
            >
              WhatsApp
            </Button>
          ) : null}
          {safeExternalUrl(instagram || business.instagram) ? (
            <Button
              as="a"
              variant="bordered"
              href={safeExternalUrl(instagram || business.instagram)}
              target="_blank"
            >
              Instagram
            </Button>
          ) : null}
        </div>
      </div>
      {isGoogleMapsUrl(mapUrl) ? (
        <iframe
          className="min-h-64 w-full rounded-2xl"
          src={mapUrl}
          title="Mapa de ubicación"
          loading="lazy"
        />
      ) : null}
    </section>
  );
}

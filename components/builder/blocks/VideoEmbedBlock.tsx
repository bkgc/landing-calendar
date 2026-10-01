import type { VideoEmbedBlockProps } from "@/types/blocks";

function getEmbedUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtube.com" || host === "youtu.be") {
      const id =
        host === "youtu.be"
          ? url.pathname.slice(1)
          : url.searchParams.get("v") ||
            url.pathname.match(/\/(?:shorts|embed)\/([^/]+)/)?.[1];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === "instagram.com" && url.pathname.includes("/reel/")) {
      return `https://www.instagram.com${url.pathname.replace(/\/$/, "")}/embed`;
    }
    if (host === "tiktok.com") {
      const id = url.pathname.match(/\/video\/(\d+)/)?.[1];
      return id ? `https://www.tiktok.com/player/v1/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

export function VideoEmbedBlock({
  title = "Mira nuestro trabajo",
  url,
}: VideoEmbedBlockProps) {
  const embedUrl = getEmbedUrl(url);
  if (!embedUrl) return null;
  return (
    <section className="space-y-5 px-5 py-16">
      <h2 className="text-3xl font-bold">{title}</h2>
      <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl bg-black">
        <iframe
          className="aspect-video w-full"
          src={embedUrl}
          title={title}
          loading="lazy"
          allowFullScreen
        />
      </div>
    </section>
  );
}

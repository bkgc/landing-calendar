import { z } from "zod";

const safeUrl = z
  .string()
  .max(2_000)
  .refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol);
    } catch {
      return false;
    }
  }, "La URL no es válida.");

const blockSchema = z.object({
  id: z.string().min(1).max(100),
  type: z.enum([
    "navbar",
    "hero",
    "services",
    "booking_calendar",
    "gallery",
    "video_embed",
    "staff",
    "testimonials",
    "text_image",
    "faq",
    "map_contact",
    "footer",
    "container",
    "image_carousel",
    "features",
    "stats",
    "call_to_action",
  ]),
  props: z.record(z.string(), z.unknown()),
});

export const landingConfigSchema = z.object({
  theme: z.object({
    primary: z.string().regex(/^#[0-9a-f]{6}$/i),
    background: z.string().regex(/^#[0-9a-f]{6}$/i),
    foreground: z.string().regex(/^#[0-9a-f]{6}$/i),
    font: z.enum([
      "Inter",
      "DM Sans",
      "Manrope",
      "Outfit",
      "Poppins",
      "Montserrat",
      "Plus Jakarta Sans",
      "Space Grotesk",
      "Playfair Display",
      "Lora",
      "Cinzel",
      "Caveat",
      "Syne",
      "Roboto",
    ]),
    radius: z.enum(["sm", "md", "lg", "full"]),
  }),
  blocks: z.array(blockSchema).min(1).max(30),
});

export function isApprovedEmbedUrl(value: string) {
  try {
    const host = new URL(value).hostname.replace(/^www\./, "");
    return ["youtube.com", "youtu.be", "instagram.com", "tiktok.com"].some(
      (domain) => host === domain || host.endsWith(`.${domain}`),
    );
  } catch {
    return false;
  }
}

export { safeUrl };

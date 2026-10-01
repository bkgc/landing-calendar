import { describe, expect, it } from "vitest";

import { BLOCK_LABELS, createBlockProps } from "../types/blocks";

describe("Landing Builder Blocks", () => {
  it("debe contener labels para los nuevos bloques", () => {
    expect(BLOCK_LABELS.features).toBe("Beneficios / Características");
    expect(BLOCK_LABELS.stats).toBe("Métricas destacadas");
    expect(BLOCK_LABELS.call_to_action).toBe("Llamada a la acción (CTA)");
  });

  it("debe generar props por defecto válidos para features", () => {
    const props = createBlockProps("features") as {
      title: string;
      items: Array<{ title: string }>;
    };
    expect(props.title).toBeTruthy();
    expect(Array.isArray(props.items)).toBe(true);
    expect(props.items.length).toBeGreaterThan(0);
  });

  it("debe generar props por defecto válidos para stats", () => {
    const props = createBlockProps("stats") as {
      items: Array<{ value: string; label: string }>;
    };
    expect(Array.isArray(props.items)).toBe(true);
    expect(props.items.length).toBe(4);
  });

  it("debe generar props por defecto válidos para call_to_action", () => {
    const props = createBlockProps("call_to_action") as {
      ctaText: string;
      title: string;
    };
    expect(props.ctaText).toBeTruthy();
    expect(props.title).toBeTruthy();
  });

  it("debe validar correctamente configuraciones con los nuevos bloques en landingConfigSchema", async () => {
    const { landingConfigSchema } = await import(
      "../lib/server/landing-validation"
    );
    const validConfig = {
      theme: {
        primary: "#0f766e",
        background: "#ffffff",
        foreground: "#111827",
        font: "Inter",
        radius: "lg",
      },
      blocks: [
        {
          id: "features-1",
          type: "features",
          props: createBlockProps("features"),
        },
        {
          id: "stats-1",
          type: "stats",
          props: createBlockProps("stats"),
        },
        {
          id: "cta-1",
          type: "call_to_action",
          props: createBlockProps("call_to_action"),
        },
      ],
    };
    const result = landingConfigSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
  });

  it("debe mapear correctamente las tipografías añadidas", async () => {
    const { getLandingFontStack, LANDING_FONT_STACKS } = await import(
      "../types/blocks"
    );
    expect(Object.keys(LANDING_FONT_STACKS).length).toBe(14);
    expect(getLandingFontStack("Poppins")).toContain("Poppins");
    expect(getLandingFontStack("Caveat")).toContain("Caveat");
    expect(getLandingFontStack("Cinzel")).toContain("Cinzel");
    expect(getLandingFontStack("Space Grotesk")).toContain("Space Grotesk");
    expect(getLandingFontStack("Inexistente")).toBe(LANDING_FONT_STACKS.Inter);
  });

  it("debe generar clases de animación correctas para entrada, salida y bucle", async () => {
    const { landingAnimationClass } = await import(
      "../components/builder/blocks/animation"
    );
    expect(landingAnimationClass("none")).toBe("");
    expect(landingAnimationClass("fade_up")).toBe(
      "landing-animate landing-animate-fade_up",
    );
    expect(landingAnimationClass("fade_out")).toBe(
      "landing-animate landing-animate-fade_out",
    );
    expect(landingAnimationClass("float")).toBe(
      "landing-animate landing-animate-float",
    );
    expect(landingAnimationClass("spin_slow")).toBe(
      "landing-animate landing-animate-spin_slow",
    );
  });

  it("debe validar configuraciones con tipografías añadidas y personalizaciones de bloques", async () => {
    const { landingConfigSchema } = await import(
      "../lib/server/landing-validation"
    );
    const customConfig = {
      theme: {
        primary: "#11766f",
        background: "#0f172a",
        foreground: "#f8fafc",
        font: "Space Grotesk",
        radius: "full",
      },
      blocks: [
        {
          id: "hero-test",
          type: "hero",
          props: {
            title: "Título con tipografía",
            ctaText: "Reservar",
            align: "center",
            padding: "lg",
            imagePosition: "left",
            badgeText: "Exclusivo",
            secondaryCtaText: "Ver más",
          },
        },
      ],
    };
    const result = landingConfigSchema.safeParse(customConfig);
    expect(result.success).toBe(true);
  });
});

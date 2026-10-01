import { describe, expect, it } from "vitest";

import { isReservedSlug, SLUG_PATTERN, slugify } from "../lib/utils/slugify";

describe("slugify", () => {
  it("normaliza acentos, espacios y símbolos", () => {
    expect(slugify("Salón María & Spa")).toBe("salon-maria-spa");
  });

  it("limita el slug al tamaño público permitido", () => {
    const value = slugify("a".repeat(80));
    expect(value).toHaveLength(30);
    expect(SLUG_PATTERN.test(value)).toBe(true);
  });

  it("protege rutas internas", () => {
    expect(isReservedSlug("dashboard")).toBe(true);
    expect(isReservedSlug("mi-negocio")).toBe(false);
  });
});

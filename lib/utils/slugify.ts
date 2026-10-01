export const SLUG_PATTERN = /^[a-z0-9-]+$/;
export const RESERVED_SLUGS = new Set([
  "login",
  "register",
  "onboarding",
  "dashboard",
  "admin",
  "api",
  "about",
  "blog",
  "docs",
  "pricing",
]);

export function isReservedSlug(value: string) {
  return RESERVED_SLUGS.has(value);
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 30);
}

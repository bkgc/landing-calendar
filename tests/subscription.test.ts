import { describe, expect, it } from "vitest";

import { hasCurrentSubscription } from "@/lib/utils/subscription";

describe("subscription entitlement periods", () => {
  const now = Date.parse("2026-10-20T12:00:00.000Z");

  it("requires an unexpired period for active subscriptions", () => {
    expect(
      hasCurrentSubscription("active", null, "2026-10-21T12:00:00.000Z", now),
    ).toBe(true);
    expect(
      hasCurrentSubscription("active", null, "2026-10-19T12:00:00.000Z", now),
    ).toBe(false);
    expect(hasCurrentSubscription("active", null, undefined, now)).toBe(false);
  });

  it("continues to honor valid trials and rejects inactive states", () => {
    expect(
      hasCurrentSubscription("trialing", "2026-10-21T12:00:00.000Z", null, now),
    ).toBe(true);
    expect(
      hasCurrentSubscription("expired", "2026-10-21T12:00:00.000Z", null, now),
    ).toBe(false);
  });
});

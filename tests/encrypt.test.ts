import { createCipheriv, createHash, randomBytes } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";

import { decrypt, encrypt } from "@/lib/utils/encrypt";

const currentKey = "a".repeat(64);

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("Google token encryption", () => {
  it("round-trips tokens with the dedicated encryption key", () => {
    vi.stubEnv("GOOGLE_TOKEN_ENCRYPTION_KEY", currentKey);
    const ciphertext = encrypt("access-token");

    expect(decrypt(ciphertext)).toBe("access-token");
  });

  it("can decrypt previously stored tokens before they are re-encrypted", () => {
    const legacySecret = "legacy-google-client-secret";
    vi.stubEnv("GOOGLE_TOKEN_ENCRYPTION_KEY", currentKey);
    vi.stubEnv("GOOGLE_CLIENT_SECRET", legacySecret);
    const iv = randomBytes(12);
    const cipher = createCipheriv(
      "aes-256-gcm",
      createHash("sha256").update(legacySecret).digest(),
      iv,
    );
    const encrypted = Buffer.concat([
      cipher.update("legacy-refresh-token", "utf8"),
      cipher.final(),
    ]);
    const ciphertext = [
      iv.toString("base64"),
      cipher.getAuthTag().toString("base64"),
      encrypted.toString("base64"),
    ].join(".");

    expect(decrypt(ciphertext)).toBe("legacy-refresh-token");
  });

  it("supports a previous dedicated key during key rotation", () => {
    const previousKey = "previous-dedicated-key";
    vi.stubEnv("GOOGLE_TOKEN_ENCRYPTION_KEY", currentKey);
    vi.stubEnv("GOOGLE_TOKEN_ENCRYPTION_KEY_LEGACY", previousKey);
    const iv = randomBytes(12);
    const cipher = createCipheriv(
      "aes-256-gcm",
      createHash("sha256").update(previousKey).digest(),
      iv,
    );
    const encrypted = Buffer.concat([
      cipher.update("rotating-refresh-token", "utf8"),
      cipher.final(),
    ]);
    const ciphertext = [
      iv.toString("base64"),
      cipher.getAuthTag().toString("base64"),
      encrypted.toString("base64"),
    ].join(".");

    expect(decrypt(ciphertext)).toBe("rotating-refresh-token");
  });
});

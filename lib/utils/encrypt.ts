import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

function getKey(): Buffer {
  const value = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY;
  if (value && /^[0-9a-f]{64}$/i.test(value)) {
    return Buffer.from(value, "hex");
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Configura GOOGLE_TOKEN_ENCRYPTION_KEY como 64 caracteres hexadecimales.",
    );
  }
  if (!value) {
    throw new Error(
      "Configura GOOGLE_TOKEN_ENCRYPTION_KEY como 64 caracteres hexadecimales.",
    );
  }
  return createHash("sha256").update(value).digest();
}

function getLegacyDecryptionKeys() {
  return [
    process.env.GOOGLE_TOKEN_ENCRYPTION_KEY_LEGACY,
    process.env.GOOGLE_TOKEN_ENCRYPTION_KEY,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.FIREBASE_ADMIN_PRIVATE_KEY,
  ]
    .filter((value): value is string => Boolean(value))
    .map((value) => createHash("sha256").update(value).digest());
}

export function encrypt(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  return [
    iv.toString("base64"),
    cipher.getAuthTag().toString("base64"),
    encrypted.toString("base64"),
  ].join(".");
}

export function decrypt(value: string) {
  const [ivValue, tagValue, encryptedValue] = value.split(".");
  const iv = Buffer.from(ivValue, "base64");
  const tag = Buffer.from(tagValue, "base64");
  const encrypted = Buffer.from(encryptedValue, "base64");
  const primaryKey = getKey();
  const keys = [
    primaryKey,
    ...getLegacyDecryptionKeys().filter(
      (key) => !key.equals(primaryKey),
    ),
  ];
  let lastError: unknown;

  for (const key of keys) {
    try {
      const decipher = createDecipheriv("aes-256-gcm", key, iv);
      decipher.setAuthTag(tag);
      return Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]).toString("utf8");
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

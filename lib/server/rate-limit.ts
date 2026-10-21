import { createHash } from "node:crypto";

import { getAdminFirestore } from "@/lib/firebase/admin";

export async function rateLimit(
  key: string,
  limit = 60,
  windowMs = 60_000,
) {
  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const id = createHash("sha256")
    .update(`${key}:${windowStart}`)
    .digest("hex");
  const reference = getAdminFirestore().doc(`rateLimits/${id}`);

  return getAdminFirestore().runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    const count = (snapshot.data()?.count as number | undefined) || 0;
    if (count >= limit) return false;
    transaction.set(reference, {
      count: count + 1,
      expiresAt: new Date(windowStart + windowMs * 2),
    });
    return true;
  });
}

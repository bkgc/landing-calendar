export function timestampToMillis(value: unknown) {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "string") return new Date(value).getTime();
  if (!value || typeof value !== "object") return Number.NaN;

  const timestamp = value as {
    toMillis?: () => number;
    toDate?: () => Date;
    seconds?: number;
  };
  if (typeof timestamp.toMillis === "function") return timestamp.toMillis();
  if (typeof timestamp.toDate === "function")
    return timestamp.toDate().getTime();
  if (typeof timestamp.seconds === "number")
    return timestamp.seconds * 1000;
  return Number.NaN;
}

export function hasCurrentSubscription(
  status: string,
  trialEndsAt: unknown,
  currentPeriodEnd: unknown,
  now = Date.now(),
) {
  if (status === "active") {
    return timestampToMillis(currentPeriodEnd) > now;
  }
  if (status === "trialing") {
    return timestampToMillis(trialEndsAt) > now;
  }
  return false;
}

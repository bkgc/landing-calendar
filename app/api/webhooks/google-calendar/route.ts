import { ok } from "@/lib/server/api";

/** Google Calendar sends an empty POST when a watched calendar changes. */
export async function POST(request: Request) {
  const channelId = request.headers.get("x-goog-channel-id");
  const resourceState = request.headers.get("x-goog-resource-state");
  if (!channelId || !resourceState) return ok({ received: false });
  // Availability always re-reads FreeBusy, so the next booking sees the change.
  return ok({ received: true, channelId, resourceState });
}

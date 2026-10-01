import { ok } from "@/lib/server/api";
import { PLANS } from "@/lib/libelula/client";

export async function GET() {
  return ok(PLANS);
}

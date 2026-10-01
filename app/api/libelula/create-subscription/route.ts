import { z } from "zod";

import { createSubscriptionPayment } from "@/lib/libelula/client";
import { fail, ok, unknownError } from "@/lib/server/api";
import { requireServerSession } from "@/lib/server/session";

const schema = z.object({ planId: z.literal("pro") });

export async function POST(request: Request) {
  try {
    const session = await requireServerSession();
    const input = schema.safeParse(await request.json());
    if (!input.success) return fail("Plan inválido.");
    const result = await createSubscriptionPayment({
      businessId: session.business.id,
      uid: session.uid,
      email: session.business.ownerEmail,
      planId: input.data.planId,
    });
    return ok(result);
  } catch (error) {
    return unknownError(error);
  }
}

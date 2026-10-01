import { z } from "zod";

import { checkLibelulaPayment } from "@/lib/libelula/client";
import { fail, ok, unknownError } from "@/lib/server/api";
import { requireServerSession } from "@/lib/server/session";

const schema = z.object({ paymentId: z.string().min(1) });

export async function POST(request: Request) {
  try {
    await requireServerSession();
    const input = schema.safeParse(await request.json());
    if (!input.success) return fail("Identificador de pago inválido.");

    const result = await checkLibelulaPayment(input.data.paymentId);
    return ok(result);
  } catch (error) {
    return unknownError(error);
  }
}

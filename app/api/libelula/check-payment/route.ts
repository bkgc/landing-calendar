import { z } from "zod";

import { checkLibelulaPayment } from "@/lib/libelula/client";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { fail, ok, unknownError } from "@/lib/server/api";
import { requireServerSession } from "@/lib/server/session";

const schema = z.object({ paymentId: z.string().min(1) });

export async function POST(request: Request) {
  try {
    const session = await requireServerSession();
    const input = schema.safeParse(await request.json());
    if (!input.success) return fail("Identificador de pago inválido.");

    const payment = await getAdminFirestore()
      .collection("payments")
      .doc(input.data.paymentId)
      .get();
    if (!payment.exists) return fail("No se encontró la solicitud de pago.", 404);
    const paymentData = payment.data();
    if (
      paymentData?.userId !== session.uid ||
      paymentData?.businessId !== session.business.id
    ) {
      return fail("No tienes permiso para consultar este pago.", 403);
    }

    const result = await checkLibelulaPayment(input.data.paymentId);
    return ok(result);
  } catch (error) {
    return unknownError(error);
  }
}

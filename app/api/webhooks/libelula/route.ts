import { checkLibelulaPayment, verifyWebhookSignature } from "@/lib/libelula/client";
import { fail, ok, unknownError } from "@/lib/server/api";

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("x-libelula-signature");

  if (!process.env.LIBELULA_WEBHOOK_SECRET || !signature) {
    return fail("Webhook no configurado o firma faltante.", 401);
  }
  if (!verifyWebhookSignature(payload, signature)) {
    return fail("Firma inválida.", 401);
  }

  let event: {
    identificador?: string;
    paymentId?: string;
  };
  try {
    event = JSON.parse(payload) as {
      identificador?: string;
      paymentId?: string;
    };
  } catch {
    return fail("Webhook inválido.", 400);
  }
  const paymentIdentifier = event.identificador || event.paymentId;
  if (!paymentIdentifier) return fail("Identificador de pago faltante.", 400);
  try {
    const result = await checkLibelulaPayment(paymentIdentifier);
    return ok({ received: true, ...result });
  } catch (error) {
    return unknownError(error);
  }
}

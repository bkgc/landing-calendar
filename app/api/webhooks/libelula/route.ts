import { checkLibelulaPayment, verifyWebhookSignature } from "@/lib/libelula/client";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { fail, ok } from "@/lib/server/api";

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("x-libelula-signature");

  // Si hay secret configurado y viene firma, verificar
  if (process.env.LIBELULA_WEBHOOK_SECRET && signature) {
    if (!verifyWebhookSignature(payload, signature)) {
      return fail("Firma inválida.", 401);
    }
  }

  try {
    const event = JSON.parse(payload) as {
      businessId?: string;
      identificador?: string;
      paymentId?: string;
      status?: string;
      subscriptionId?: string;
      currentPeriodEnd?: string;
      plan?: "pro";
    };

    const paymentIdentifier = event.identificador || event.paymentId;
    if (paymentIdentifier) {
      const result = await checkLibelulaPayment(paymentIdentifier);
      return ok({ received: true, ...result });
    }

    if (event.businessId) {
      const status =
        event.status === "active"
          ? "active"
          : event.status === "past_due"
            ? "past_due"
            : "expired";

      await getAdminFirestore()
        .doc(`businesses/${event.businessId}`)
        .update({
          subscriptionStatus: status,
          plan: status === "active" ? event.plan || "pro" : "free",
          libelulaSubscriptionId: event.subscriptionId || null,
          currentPeriodEnd: event.currentPeriodEnd || null,
          updatedAt: new Date(),
        });

      return ok({ received: true });
    }

    return ok({ received: true });
  } catch {
    return fail("Webhook inválido.", 400);
  }
}

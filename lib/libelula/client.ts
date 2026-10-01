import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { getAdminFirestore } from "@/lib/firebase/admin";

export interface PlanDefinition {
  id: "free" | "pro";
  name: string;
  price: number;
  currency: string;
  features: {
    maxStaff: number;
    maxServices: number | null;
    removeBranding: boolean;
    customDomain: boolean;
    pushNotifications: boolean;
  };
}

export const PLANS: PlanDefinition[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    currency: "BOB",
    features: {
      maxStaff: 1,
      maxServices: 5,
      removeBranding: false,
      customDomain: false,
      pushNotifications: false,
    },
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    currency: "BOB",
    features: {
      maxStaff: 5,
      maxServices: null,
      removeBranding: true,
      customDomain: false,
      pushNotifications: true,
    },
  },
];

export function getLibelulaConfig() {
  const apiUrl = (
    process.env.API_LIBELULA ||
    process.env.LIBELULA_API_URL ||
    (process.env.LIBELULA_WEBHOOK_SECRET?.startsWith("http")
      ? process.env.LIBELULA_WEBHOOK_SECRET
      : null) ||
    "https://api.todotix.com/rest/deuda"
  ).replace(/\/$/, "");

  const appKey =
    process.env.APPKEY_LIBELULA ||
    process.env.LIBELULA_API_KEY ||
    "11bb10ce-68ba-4af1-8eb7-4e6624fed729";

  return { apiUrl, appKey };
}

export interface CreateSubscriptionPaymentInput {
  businessId: string;
  uid: string;
  email: string;
  planId: "pro";
}

export async function createSubscriptionPayment({
  businessId,
  uid,
  email,
  planId,
}: CreateSubscriptionPaymentInput) {
  const { apiUrl, appKey } = getLibelulaConfig();
  if (!appKey) {
    throw new Error("Falta configurar APPKEY_LIBELULA en el archivo .env.local.");
  }

  const paymentId = randomUUID();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const clientEmail =
    email && emailRegex.test(email)
      ? email
      : process.env.BREVO_FROM_EMAIL || "publicaciones@ofertasbolivia.bo";

  const targetPlan = PLANS.find((p) => p.id === planId) || PLANS[1];
  const amount = targetPlan.price;

  const response = await fetch(`${apiUrl}/registrar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      appkey: appKey,
      email_cliente: clientEmail,
      identificador: paymentId,
      descripcion: `Suscripción Plan Pro AgendaPro`,
      lineas_detalle_deuda: [
        {
          concepto: `Plan Pro AgendaPro (1 mes)`,
          cantidad: 1,
          costo_unitario: amount,
          descuento_unitario: 0,
        },
      ],
    }),
  });

  const body = (await response.json().catch(() => null)) as {
    error?: number;
    mensaje?: string;
    qr_simple_url?: string;
    qr_imagen?: string;
    url_pasarela_pagos?: string;
    id_transaccion?: string | null;
  } | null;

  if (!response.ok || !body || (body.error && body.error !== 0)) {
    throw new Error(
      body?.mensaje ||
        "Libélula no pudo generar la solicitud de pago QR. Intenta nuevamente.",
    );
  }

  const db = getAdminFirestore();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos de validez

  await db.collection("payments").doc(paymentId).set({
    paymentId,
    businessId,
    userId: uid,
    email: clientEmail,
    plan: planId,
    amount,
    currency: "BOB",
    status: "pending",
    qrUrl: body.qr_simple_url || null,
    qrImage: body.qr_imagen || null,
    checkoutUrl: body.url_pasarela_pagos || null,
    transactionId: body.id_transaccion || null,
    createdAt: new Date(),
    expiresAt,
  });

  await db.doc(`businesses/${businessId}`).update({
    pendingPaymentId: paymentId,
    updatedAt: new Date(),
  });

  return {
    paymentId,
    qrUrl: body.qr_simple_url || null,
    qrImage: body.qr_imagen || null,
    checkoutUrl: body.url_pasarela_pagos || null,
    amount,
    currency: "BOB",
    expiresAt: expiresAt.toISOString(),
  };
}

export async function checkLibelulaPayment(paymentId: string) {
  const { apiUrl, appKey } = getLibelulaConfig();
  const db = getAdminFirestore();
  const paymentRef = db.collection("payments").doc(paymentId);
  const paymentSnap = await paymentRef.get();

  if (!paymentSnap.exists) {
    throw new Error("No se encontró la solicitud de pago.");
  }

  const paymentData = paymentSnap.data() as {
    businessId: string;
    status: string;
    plan: string;
    amount: number;
  };

  if (paymentData.status === "confirmed") {
    return {
      paid: true,
      status: "confirmed" as const,
      businessId: paymentData.businessId,
    };
  }

  const response = await fetch(`${apiUrl}/consultar_deudas/por_identificador`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      appkey: appKey,
      identificador: paymentId,
    }),
  });

  if (!response.ok) {
    throw new Error("No se pudo conectar con el servicio de Libélula.");
  }

  const result = (await response.json()) as {
    error?: number;
    mensaje?: string;
    datos?: {
      pagado?: boolean;
      deuda_expirada?: boolean;
    } | null;
  };

  const isPaid = Boolean(result?.datos?.pagado);
  const isExpired = Boolean(result?.datos?.deuda_expirada);

  if (isPaid) {
    const now = new Date();
    const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 días

    const batch = db.batch();
    batch.update(paymentRef, {
      status: "confirmed",
      confirmedAt: now,
      updatedAt: now,
    });

    batch.update(db.doc(`businesses/${paymentData.businessId}`), {
      subscriptionStatus: "active",
      plan: "pro",
      libelulaPaymentId: paymentId,
      currentPeriodEnd: periodEnd,
      updatedAt: now,
    });

    await batch.commit();

    return {
      paid: true,
      status: "confirmed" as const,
      businessId: paymentData.businessId,
    };
  }

  if (isExpired) {
    await paymentRef.update({
      status: "expired",
      updatedAt: new Date(),
    });
    return {
      paid: false,
      status: "expired" as const,
      businessId: paymentData.businessId,
    };
  }

  return {
    paid: false,
    status: "pending" as const,
    businessId: paymentData.businessId,
  };
}

export function verifyWebhookSignature(
  payload: string,
  signature: string | null,
) {
  if (!process.env.LIBELULA_WEBHOOK_SECRET || !signature) return false;
  const expected = createHmac("sha256", process.env.LIBELULA_WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");
  const left = Buffer.from(expected);
  const right = Buffer.from(signature);
  return left.length === right.length && timingSafeEqual(left, right);
}

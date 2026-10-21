import { z } from "zod";

import { getAvailableSlots } from "@/lib/google/availability";
import { fail, ok, unknownError } from "@/lib/server/api";
import { rateLimit } from "@/lib/server/rate-limit";
import { hasActiveSubscription } from "@/lib/server/session";

const querySchema = z.object({
  businessId: z.string().min(1),
  serviceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  staffId: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const input = querySchema.safeParse(Object.fromEntries(url.searchParams));
    if (!input.success) return fail("Parámetros de disponibilidad inválidos.");
    const source =
      request.headers.get("x-real-ip")?.trim() ||
      request.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() ||
      "unknown";
    if (
      !(await rateLimit(
        `availability:${source}:${input.data.businessId}`,
        60,
        60_000,
      ))
    )
      return fail(
        "Demasiadas consultas. Intenta nuevamente en un minuto.",
        429,
      );

    const admin = await import("@/lib/firebase/admin");
    const database = admin.getAdminFirestore();
    const businessSnapshot = await database
      .doc(`businesses/${input.data.businessId}`)
      .get();
    if (!businessSnapshot.exists)
      return fail("Negocio no encontrado.", 404);
    if (!hasActiveSubscription(businessSnapshot.data() as never))
      return fail("Este negocio no acepta nuevas reservas.", 402);

    const serviceSnapshot = await database
      .doc(
        `businesses/${input.data.businessId}/services/${input.data.serviceId}`,
      )
      .get();
    if (!serviceSnapshot.exists) return fail("Servicio no encontrado.", 404);

    const service = serviceSnapshot.data() as {
      duration: number;
      bufferTime?: number;
      staffIds?: string[];
      active?: boolean;
    };
    if (service.active !== true)
      return fail("Este servicio no está disponible.", 404);

    let staffId = input.data.staffId;

    // Si no hay staffId explícito, buscar si existe algún integrante activo en el negocio
    if (!staffId) {
      const staffSnapshot = await database
        .collection(`businesses/${input.data.businessId}/staff`)
        .where("active", "==", true)
        .get();
      staffId = staffSnapshot.docs.find(
        (document) =>
          !service.staffIds?.length || service.staffIds.includes(document.id),
      )?.id;
    }
    if (staffId) {
      const staffSnapshot = await database
        .doc(`businesses/${input.data.businessId}/staff/${staffId}`)
        .get();
      if (
        !staffSnapshot.exists ||
        staffSnapshot.data()?.active !== true ||
        (service.staffIds?.length && !service.staffIds.includes(staffId))
      ) {
        return fail("El profesional no puede atender este servicio.", 400);
      }
    }

    const slots = await getAvailableSlots({
      businessId: input.data.businessId,
      staffId: staffId || undefined,
      date: input.data.date,
      serviceDuration: service.duration,
      bufferTime: service.bufferTime || 0,
    });

    return ok({ slots, staffId: staffId || "default" });
  } catch (error) {
    return unknownError(error);
  }
}

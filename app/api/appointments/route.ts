import { z } from "zod";

import { getAdminFirestore } from "@/lib/firebase/admin";
import { getStaffCalendarId } from "@/lib/google/calendar";
import { getAvailableSlots } from "@/lib/google/availability";
import { notifyOwnerOfAppointment } from "@/lib/notifications/server";
import { fail, ok, unknownError } from "@/lib/server/api";
import {
  hasActiveSubscription,
  requireServerSession,
} from "@/lib/server/session";
import { rateLimit } from "@/lib/server/rate-limit";
import { dateWithBusinessTime } from "@/lib/utils/date";

const bookingSchema = z.object({
  businessId: z.string().min(1),
  serviceId: z.string().min(1),
  staffId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  clientName: z.string().trim().min(2),
  clientPhone: z.string().trim().min(6),
  clientEmail: z.string().email().or(z.literal("")),
});

export async function GET() {
  try {
    const session = await requireServerSession();
    const snapshot = await getAdminFirestore()
      .collection(`businesses/${session.business.id}/appointments`)
      .orderBy("start", "desc")
      .limit(100)
      .get();
    return ok(
      snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      })),
    );
  } catch (error) {
    return unknownError(error);
  }
}

export async function POST(request: Request) {
  try {
    const source = request.headers.get("x-forwarded-for") || "public";
    if (!rateLimit(`appointment:${source}`, 20, 60_000))
      return fail(
        "Demasiadas solicitudes. Intenta nuevamente en un minuto.",
        429,
      );
    const input = bookingSchema.safeParse(await request.json());
    if (!input.success)
      return fail(
        input.error.issues[0]?.message || "Datos de reserva inválidos.",
      );
    const database = getAdminFirestore();
    const businessSnapshot = await database
      .doc(`businesses/${input.data.businessId}`)
      .get();
    const serviceSnapshot = await database
      .doc(
        `businesses/${input.data.businessId}/services/${input.data.serviceId}`,
      )
      .get();
    if (!businessSnapshot.exists || !serviceSnapshot.exists)
      return fail("El negocio o servicio no existe.", 404);
    const business = businessSnapshot.data() as { ownerId: string };
    if (!hasActiveSubscription(businessSnapshot.data() as never))
      return fail(
        "Este negocio no acepta nuevas reservas en este momento.",
        402,
      );
    if ((businessSnapshot.data()?.plan as string) === "free") {
      const monthStart = new Date();
      monthStart.setUTCDate(1);
      monthStart.setUTCHours(0, 0, 0, 0);
      const monthCount = (
        await database
          .collection(`businesses/${input.data.businessId}/appointments`)
          .where("createdAt", ">=", monthStart)
          .get()
      ).docs.filter(
        (document) => document.data().status !== "cancelled",
      ).length;
      if (monthCount >= 30)
        return fail("El plan Free permite hasta 30 citas por mes.", 403);
    }
    const service = serviceSnapshot.data() as {
      name: string;
      duration: number;
      bufferTime?: number;
      staffIds?: string[];
    };
    let staffId = input.data.staffId || service.staffIds?.[0];
    if (!staffId) {
      const staffSnapshot = await database
        .collection(`businesses/${input.data.businessId}/staff`)
        .where("active", "==", true)
        .limit(1)
        .get();
      if (!staffSnapshot.empty) {
        staffId = staffSnapshot.docs[0].id;
      } else {
        const defaultStaffRef = database
          .collection(`businesses/${input.data.businessId}/staff`)
          .doc();
        await defaultStaffRef.set({
          name: (businessSnapshot.data()?.name as string) || "Equipo de Atención",
          role: "Especialista",
          googleCalendarId: "primary",
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        staffId = defaultStaffRef.id;
      }
    }

    const slots = await getAvailableSlots({
      businessId: input.data.businessId,
      staffId,
      date: input.data.date,
      serviceDuration: service.duration,
      bufferTime: service.bufferTime || 0,
    });
    if (!slots.includes(input.data.time))
      return fail("Ese horario ya no está disponible.", 409);

    const start = dateWithBusinessTime(input.data.date, input.data.time);
    const end = new Date(start.getTime() + service.duration * 60_000);
    const appointmentReference = database
      .collection(`businesses/${input.data.businessId}/appointments`)
      .doc();
    const lockReference = database.doc(
      `businesses/${input.data.businessId}/appointmentLocks/${staffId}_${input.data.date}_${input.data.time.replace(":", "-")}`,
    );
    await database.runTransaction(async (transaction) => {
      const lock = await transaction.get(lockReference);
      if (lock.exists) throw new Error("Ese horario ya fue reservado.");
      transaction.create(lockReference, {
        appointmentId: appointmentReference.id,
        createdAt: new Date(),
      });
      transaction.create(appointmentReference, {
        businessId: input.data.businessId,
        serviceId: input.data.serviceId,
        staffId,
        clientName: input.data.clientName,
        clientPhone: input.data.clientPhone,
        clientEmail: input.data.clientEmail,
        start: start.toISOString(),
        end: end.toISOString(),
        status: "confirmed",
        createdAt: new Date(),
      });
    });

    const appointment = {
      id: appointmentReference.id,
      businessId: input.data.businessId,
      serviceId: input.data.serviceId,
      staffId,
      clientName: input.data.clientName,
      clientPhone: input.data.clientPhone,
      clientEmail: input.data.clientEmail,
      start: start.toISOString(),
      end: end.toISOString(),
      status: "confirmed" as const,
    };
    try {
      const { getGoogleClient } = await import("@/lib/google/client");
      const calendar = await getGoogleClient(input.data.businessId);
      const calendarId = await getStaffCalendarId(
        input.data.businessId,
        staffId,
      );
      const event = await calendar.events.insert({
        calendarId,
        requestBody: {
          summary: `${service.name} - ${input.data.clientName}`,
          description: `Reserva creada en AgendaPro. WhatsApp: ${input.data.clientPhone}`,
          start: { dateTime: start.toISOString() },
          end: { dateTime: end.toISOString() },
          attendees: input.data.clientEmail
            ? [{ email: input.data.clientEmail }]
            : undefined,
          reminders: { useDefault: true },
        },
      });
      await appointmentReference.update({
        googleEventId: event.data.id || null,
        calendarId,
      });
    } catch {
      await appointmentReference.update({ calendarSyncPending: true });
    }
    await notifyOwnerOfAppointment({
      businessId: input.data.businessId,
      ownerId: business.ownerId,
      appointment,
      serviceName: service.name,
    });
    return ok(appointment, 201);
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("ya fue reservado")
        ? error.message
        : null;
    return message ? fail(message, 409) : unknownError(error);
  }
}

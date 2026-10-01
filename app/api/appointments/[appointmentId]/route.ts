import { z } from "zod";

import { getAdminFirestore } from "@/lib/firebase/admin";
import { getStaffCalendarId } from "@/lib/google/calendar";
import { getAvailableSlots } from "@/lib/google/availability";
import { fail, ok, unknownError } from "@/lib/server/api";
import { requireServerSession } from "@/lib/server/session";

const patchSchema = z.object({
  status: z.enum(["cancelled", "completed", "no_show", "confirmed"]).optional(),
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional(),
});

function localSlot(value: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/La_Paz",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value));
  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value || "";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${get("hour")}:${get("minute")}`,
  };
}

function lockPath(staffId: string, date: string, time: string) {
  return `appointmentLocks/${staffId}_${date}_${time.replace(":", "-")}`;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ appointmentId: string }> },
) {
  try {
    const session = await requireServerSession();
    const { appointmentId } = await params;
    const input = patchSchema.safeParse(await request.json());
    if (!input.success) return fail("Estado inválido.");
    const reference = getAdminFirestore().doc(
      `businesses/${session.business.id}/appointments/${appointmentId}`,
    );
    const snapshot = await reference.get();
    if (!snapshot.exists) return fail("Cita no encontrada.", 404);
    const current = snapshot.data() as {
      staffId: string;
      serviceId: string;
      start: string;
      end: string;
      status: string;
      googleEventId?: string;
      calendarId?: string;
    };
    const updates = { ...input.data, updatedAt: new Date() };
    if (input.data.start && input.data.end) {
      const serviceSnapshot = await getAdminFirestore()
        .doc(`businesses/${session.business.id}/services/${current.serviceId}`)
        .get();
      const service = serviceSnapshot.data() as {
        duration: number;
        bufferTime?: number;
      };
      const requested = localSlot(input.data.start);
      const slots = await getAvailableSlots({
        businessId: session.business.id,
        staffId: current.staffId,
        date: requested.date,
        serviceDuration: service.duration,
        bufferTime: service.bufferTime || 0,
      });
      if (!slots.includes(requested.time))
        return fail("Ese horario ya no está disponible.", 409);
      const old = localSlot(current.start);
      const oldLock = getAdminFirestore().doc(
        `businesses/${session.business.id}/${lockPath(current.staffId, old.date, old.time)}`,
      );
      const newLock = getAdminFirestore().doc(
        `businesses/${session.business.id}/${lockPath(current.staffId, requested.date, requested.time)}`,
      );
      await getAdminFirestore().runTransaction(async (transaction) => {
        const newLockSnapshot = await transaction.get(newLock);
        if (newLock.path !== oldLock.path && newLockSnapshot.exists)
          throw new Error("Ese horario ya fue reservado.");
        if (newLock.path !== oldLock.path) {
          transaction.delete(oldLock);
          transaction.create(newLock, { appointmentId, createdAt: new Date() });
        }
        transaction.update(reference, updates);
      });
    } else {
      const old = localSlot(current.start);
      const oldLock = getAdminFirestore().doc(
        `businesses/${session.business.id}/${lockPath(current.staffId, old.date, old.time)}`,
      );
      await getAdminFirestore().runTransaction(async (transaction) => {
        if (input.data.status === "cancelled") transaction.delete(oldLock);
        transaction.update(reference, updates);
      });
    }
    if (input.data.start && input.data.end && snapshot.data()?.googleEventId) {
      try {
        const { getGoogleClient } = await import("@/lib/google/client");
        const calendar = await getGoogleClient(session.business.id);
        const calendarId =
          current.calendarId ||
          (await getStaffCalendarId(session.business.id, current.staffId));
        await calendar.events.patch({
          calendarId,
          eventId: snapshot.data()?.googleEventId as string,
          requestBody: {
            start: { dateTime: input.data.start },
            end: { dateTime: input.data.end },
          },
        });
      } catch {
        /* La fecha local permite operar incluso si Google está temporalmente indisponible. */
      }
    }
    if (input.data.status === "cancelled" && current.googleEventId) {
      try {
        const { getGoogleClient } = await import("@/lib/google/client");
        const calendar = await getGoogleClient(session.business.id);
        const calendarId =
          current.calendarId ||
          (await getStaffCalendarId(session.business.id, current.staffId));
        await calendar.events.delete({
          calendarId,
          eventId: current.googleEventId,
        });
      } catch {
        /* El estado local sigue siendo la fuente operativa. */
      }
    }
    return ok({ id: appointmentId, status: input.data.status });
  } catch (error) {
    return unknownError(error);
  }
}

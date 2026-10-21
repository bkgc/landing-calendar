import { z } from "zod";

import { getAdminFirestore } from "@/lib/firebase/admin";
import { getStaffCalendarId } from "@/lib/google/calendar";
import { getAvailableSlots } from "@/lib/google/availability";
import { fail, ok, unknownError } from "@/lib/server/api";
import { getAppointmentLockReferences } from "@/lib/server/appointment-locks";
import { requireServerSession } from "@/lib/server/session";
import { businessDateAndTime } from "@/lib/utils/date";

const patchSchema = z
  .object({
    status: z.enum(["cancelled", "completed", "no_show", "confirmed"]).optional(),
    start: z.string().datetime().optional(),
    end: z.string().datetime().optional(),
  })
  .refine(
    (value) =>
      (value.start === undefined && value.end === undefined) ||
      (value.start !== undefined && value.end !== undefined),
    "La fecha de inicio y fin deben enviarse juntas.",
  );

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ appointmentId: string }> },
) {
  try {
    const session = await requireServerSession();
    const { appointmentId } = await params;
    const input = patchSchema.safeParse(await request.json());
    if (!input.success) return fail(input.error.issues[0]?.message || "Datos inválidos.");

    const database = getAdminFirestore();
    const reference = database.doc(
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
    const serviceSnapshot = await database
      .doc(`businesses/${session.business.id}/services/${current.serviceId}`)
      .get();
    if (!serviceSnapshot.exists) return fail("El servicio de esta cita ya no existe.", 409);
    const service = serviceSnapshot.data() as {
      duration: number;
      bufferTime?: number;
    };
    const requestedStart = input.data.start || current.start;
    const requestedStartDate = new Date(requestedStart);
    const requestedEnd = input.data.end || current.end;
    const expectedEnd = new Date(
      requestedStartDate.getTime() + service.duration * 60_000,
    );
    if (
      !Number.isFinite(requestedStartDate.getTime()) ||
      new Date(requestedEnd).getTime() !== expectedEnd.getTime()
    ) {
      return fail("La duración de la cita no coincide con el servicio.", 400);
    }

    const currentSlot = businessDateAndTime(current.start);
    const requestedSlot = businessDateAndTime(requestedStart);
    const startChanged =
      currentSlot.date !== requestedSlot.date ||
      currentSlot.time !== requestedSlot.time;
    const nextStatus = input.data.status || current.status;
    const wasConfirmed = current.status === "confirmed";
    const willBeConfirmed = nextStatus === "confirmed";

    if (willBeConfirmed && (!wasConfirmed || startChanged)) {
      const slots = await getAvailableSlots({
        businessId: session.business.id,
        staffId: current.staffId,
        date: requestedSlot.date,
        serviceDuration: service.duration,
        bufferTime: service.bufferTime || 0,
        excludeAppointmentId: appointmentId,
        excludeGoogleEventId: current.googleEventId,
      });
      if (!slots.includes(requestedSlot.time))
        return fail("Ese horario ya no está disponible.", 409);
    }

    const oldLocks = wasConfirmed
      ? getAppointmentLockReferences(
          database,
          session.business.id,
          current.staffId,
          currentSlot.date,
          currentSlot.time,
          service.duration + (service.bufferTime || 0),
        )
      : [];
    const newLocks = willBeConfirmed
      ? getAppointmentLockReferences(
          database,
          session.business.id,
          current.staffId,
          requestedSlot.date,
          requestedSlot.time,
          service.duration + (service.bufferTime || 0),
        )
      : [];
    const lockRefs = Array.from(
      new Map<string, FirebaseFirestore.DocumentReference>(
        [...oldLocks, ...newLocks].map(
          (lock): [string, FirebaseFirestore.DocumentReference] => [
            lock.path,
            lock,
          ],
        ),
      ).values(),
    );
    const updatedStart = input.data.start || current.start;
    const updatedEnd = input.data.start
      ? expectedEnd.toISOString()
      : current.end;

    await database.runTransaction(async (transaction) => {
      const existingLocks = new Map<
        string,
        FirebaseFirestore.DocumentSnapshot
      >();
      for (const lock of lockRefs) {
        existingLocks.set(lock.path, await transaction.get(lock));
      }

      for (const lock of newLocks) {
        const existing = existingLocks.get(lock.path);
        if (
          existing?.exists &&
          existing.data()?.appointmentId !== appointmentId
        ) {
          throw new Error("Ese horario ya fue reservado.");
        }
      }

      for (const lock of oldLocks) {
        const existing = existingLocks.get(lock.path);
        if (
          existing?.exists &&
          existing.data()?.appointmentId === appointmentId &&
          !newLocks.some((newLock) => newLock.path === lock.path)
        ) {
          transaction.delete(lock);
        }
      }
      for (const lock of newLocks) {
        if (!existingLocks.get(lock.path)?.exists) {
          transaction.create(lock, { appointmentId, createdAt: new Date() });
        }
      }

      transaction.update(reference, {
        ...input.data,
        start: updatedStart,
        end: updatedEnd,
        status: nextStatus,
        updatedAt: new Date(),
      });
    });

    if (startChanged && current.googleEventId) {
      try {
        const { getGoogleClient } = await import("@/lib/google/client");
        const calendar = await getGoogleClient(session.business.id);
        const calendarId =
          current.calendarId ||
          (await getStaffCalendarId(session.business.id, current.staffId));
        await calendar.events.patch({
          calendarId,
          eventId: current.googleEventId,
          requestBody: {
            start: { dateTime: updatedStart },
            end: { dateTime: updatedEnd },
          },
        });
      } catch {
        // La cita local continúa siendo operativa si Google no responde.
      }
    }

    if (nextStatus === "cancelled" && wasConfirmed && current.googleEventId) {
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
        // El estado local sigue siendo la fuente operativa.
      }
    }
    return ok({ id: appointmentId, status: nextStatus });
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("ya fue reservado")
        ? error.message
        : null;
    return message ? fail(message, 409) : unknownError(error);
  }
}

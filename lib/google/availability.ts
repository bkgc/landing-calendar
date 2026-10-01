import { getAdminFirestore } from "@/lib/firebase/admin";
import { getStaffCalendarId } from "@/lib/google/calendar";
import { getGoogleClient } from "@/lib/google/client";
import {
  BUSINESS_TIME_ZONE,
  businessDateAndTime,
  dateWithBusinessTime,
} from "@/lib/utils/date";
import type { BusinessHours } from "@/types/business";

const DEFAULT_HOURS: BusinessHours = {
  monday: { open: "09:00", close: "18:00", enabled: true },
  tuesday: { open: "09:00", close: "18:00", enabled: true },
  wednesday: { open: "09:00", close: "18:00", enabled: true },
  thursday: { open: "09:00", close: "18:00", enabled: true },
  friday: { open: "09:00", close: "18:00", enabled: true },
  saturday: { open: "10:00", close: "14:00", enabled: true },
  sunday: { open: "09:00", close: "18:00", enabled: false },
};

const DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;
function overlaps(start: Date, end: Date, busyStart: Date, busyEnd: Date) {
  return start < busyEnd && end > busyStart;
}

export async function getAvailableSlots({
  businessId,
  staffId,
  date,
  serviceDuration,
  bufferTime = 0,
}: {
  businessId: string;
  staffId?: string;
  date: string;
  serviceDuration: number;
  bufferTime?: number;
}) {
  const database = getAdminFirestore();
  const hoursSnapshot = await database
    .doc(`businesses/${businessId}/settings/businessHours`)
    .get();
  const hours = {
    ...DEFAULT_HOURS,
    ...(hoursSnapshot.data() as Partial<BusinessHours> | undefined),
  };
  const day = hours[DAY_KEYS[dateWithBusinessTime(date, "12:00").getDay()]];
  if (!day?.enabled) return [];

  const [year, month, dayNumber] = date.split("-").map(Number);
  if (!year || !month || !dayNumber) return [];
  const open = dateWithBusinessTime(date, day.open);
  const close = dateWithBusinessTime(date, day.close);
  const busy: Array<{ start: Date; end: Date }> = [];

  if (staffId) {
    const calendarId = await getStaffCalendarId(businessId, staffId);
    try {
      const calendar = await getGoogleClient(businessId);
      const response = await calendar.freebusy.query({
        requestBody: {
          timeMin: open.toISOString(),
          timeMax: close.toISOString(),
          items: [{ id: calendarId || "primary" }],
        },
      });
      for (const item of response.data.calendars?.[calendarId]?.busy || []) {
        if (item.start && item.end)
          busy.push({ start: new Date(item.start), end: new Date(item.end) });
      }
    } catch {
      // Horarios configurados siguen funcionando como fallback si Google no está conectado.
    }
    const appointments = await database
      .collection(`businesses/${businessId}/appointments`)
      .where("staffId", "==", staffId)
      .where("status", "==", "confirmed")
      .get();
    appointments.docs.forEach((document) => {
      const appointment = document.data();
      const start = new Date(appointment.start);
      if (businessDateAndTime(start).date === date)
        busy.push({ start, end: new Date(appointment.end) });
    });
  }

  const slots: string[] = [];
  const now = new Date();
  for (
    let cursor = new Date(open);
    cursor < close;
    cursor = new Date(cursor.getTime() + 15 * 60_000)
  ) {
    const end = new Date(
      cursor.getTime() + (serviceDuration + bufferTime) * 60_000,
    );
    if (
      cursor <= now ||
      end > close ||
      busy.some((item) => overlaps(cursor, end, item.start, item.end))
    )
      continue;
    slots.push(
      new Intl.DateTimeFormat("en-GB", {
        timeZone: BUSINESS_TIME_ZONE,
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }).format(cursor),
    );
  }
  return slots;
}

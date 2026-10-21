export const BUSINESS_TIME_ZONE = "America/La_Paz";

const BUSINESS_OFFSET = "-04:00";

export function dateWithBusinessTime(date: string, time: string) {
  return new Date(`${date}T${time}:00${BUSINESS_OFFSET}`);
}

export function formatBusinessTime(value: string | Date) {
  return new Intl.DateTimeFormat("es-BO", {
    timeZone: BUSINESS_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(value));
}

export function businessDateAndTime(value: string | Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIME_ZONE,
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

export function formatBusinessDate(value: string | Date) {
  return new Intl.DateTimeFormat("es-BO", {
    timeZone: BUSINESS_TIME_ZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

export function dateKeyFromCalendarValue(value: {
  year: number;
  month: number;
  day: number;
}) {
  return `${value.year}-${String(value.month).padStart(2, "0")}-${String(value.day).padStart(2, "0")}`;
}

export function getBusinessWeek(date = new Date()) {
  const current = new Date(date);
  current.setHours(12, 0, 0, 0);
  const mondayOffset = (current.getDay() + 6) % 7;
  current.setDate(current.getDate() - mondayOffset);
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(current);
    day.setDate(current.getDate() + index);
    const dateKey = [
      day.getFullYear(),
      String(day.getMonth() + 1).padStart(2, "0"),
      String(day.getDate()).padStart(2, "0"),
    ].join("-");
    return { dateKey, date: day };
  });
}export function getDayOfWeekInBusinessTz(dateStr: string): number {
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return 0;
  // Usamos Date.UTC a las 12:00 para evitar cualquier desajuste de huso horario
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0)).getUTCDay();
}

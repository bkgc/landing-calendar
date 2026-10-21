import type { Firestore } from "firebase-admin/firestore";

export function getAppointmentLockIds(
  date: string,
  time: string,
  durationMinutes: number,
) {
  const [hour, minute] = time.split(":").map(Number);
  const startMinute = hour * 60 + minute;
  const firstBucket = Math.floor(startMinute / 15);
  const bucketCount = Math.ceil(durationMinutes / 15);

  return Array.from({ length: bucketCount }, (_, index) => {
    const totalMinutes = (firstBucket + index) * 15;
    const lockTime = `${String(Math.floor(totalMinutes / 60)).padStart(2, "0")}-${String(totalMinutes % 60).padStart(2, "0")}`;
    return `${date}_${lockTime}`;
  });
}

export function getAppointmentLockReferences(
  database: Firestore,
  businessId: string,
  staffId: string,
  date: string,
  time: string,
  durationMinutes: number,
) {
  return getAppointmentLockIds(date, time, durationMinutes).map((slot) =>
    database.doc(
      `businesses/${businessId}/appointmentLocks/${staffId}_${slot}`,
    ),
  );
}

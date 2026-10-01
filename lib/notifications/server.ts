import { Resend } from "resend";

import { getAdminFirestore, getAdminMessaging } from "@/lib/firebase/admin";
import { formatBusinessDate, formatBusinessTime } from "@/lib/utils/date";
import type { Appointment } from "@/types/appointment";

function escapeHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character] || character,
  );
}

async function sendEmail(to: string, subject: string, body: string) {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) return;
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to,
    subject,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>${escapeHtml(subject)}</h2><p>${escapeHtml(body)}</p></div>`,
  });
}

export async function notifyOwnerOfAppointment({
  businessId,
  ownerId,
  appointment,
  serviceName,
}: {
  businessId: string;
  ownerId: string;
  appointment: Appointment;
  serviceName: string;
}) {
  const date = formatBusinessDate(appointment.start);
  const time = formatBusinessTime(appointment.start);
  const title = `Nueva cita: ${appointment.clientName}`;
  const body = `${serviceName} · ${date} a las ${time}`;
  const database = getAdminFirestore();
  await database.collection(`businesses/${businessId}/notifications`).add({
    businessId,
    title,
    body,
    appointmentId: appointment.id,
    read: false,
    createdAt: new Date(),
  });

  try {
    const profile = await database.doc(`users/${ownerId}`).get();
    const tokensSnapshot = await database
      .collection(`users/${ownerId}/fcmTokens`)
      .get();
    const tokens = tokensSnapshot.docs
      .map((document) => document.data().token as string)
      .filter(Boolean);
    if (tokens.length) {
      const response = await getAdminMessaging().sendEachForMulticast({
        tokens,
        notification: { title, body },
        webpush: { fcmOptions: { link: "/dashboard/appointments" } },
      });

      const invalidDocRefs = [];
      for (let i = 0; i < response.responses.length; i++) {
        const res = response.responses[i];
        if (!res.success) {
          const code = res.error?.code;
          if (
            code === "messaging/registration-token-not-registered" ||
            code === "messaging/invalid-registration-token"
          ) {
            const doc = tokensSnapshot.docs[i];
            if (doc) invalidDocRefs.push(doc.ref);
          }
        }
      }

      if (invalidDocRefs.length > 0) {
        const batch = database.batch();
        invalidDocRefs.forEach((ref) => batch.delete(ref));
        await batch.commit().catch(() => {});
      }
    }
    const ownerEmail = profile.data()?.email as string | undefined;
    if (ownerEmail) await sendEmail(ownerEmail, title, body);
    if (appointment.clientEmail) {
      await sendEmail(
        appointment.clientEmail,
        `Cita confirmada en ${serviceName}`,
        `Tu reserva quedó confirmada para el ${date} a las ${time}.`,
      );
    }
  } catch {
    // Las notificaciones no deben deshacer una reserva confirmada.
  }
}

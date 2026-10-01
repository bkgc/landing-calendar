export type AppointmentStatus =
  "confirmed" | "cancelled" | "completed" | "no_show";

export interface Appointment {
  id: string;
  businessId: string;
  serviceId: string;
  staffId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  start: string;
  end: string;
  googleEventId?: string;
  status: AppointmentStatus;
  createdAt?: unknown;
}

export interface AppointmentNotification {
  id: string;
  businessId: string;
  title: string;
  body: string;
  appointmentId?: string;
  read: boolean;
  createdAt?: unknown;
}

export interface StaffMember {
  id: string;
  businessId: string;
  name: string;
  avatar?: string;
  role: string;
  email?: string;
  googleCalendarId?: string;
  services: string[];
  active: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

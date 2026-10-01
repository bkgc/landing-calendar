import type { Timestamp } from "firebase/firestore";

export const BUSINESS_CATEGORIES = [
  "belleza",
  "barberia",
  "salud",
  "bienestar",
  "consultoria",
  "otro",
] as const;

export type BusinessCategory = (typeof BUSINESS_CATEGORIES)[number];
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "expired";
export type PlanId = "free" | "pro";

export interface Business {
  id: string;
  ownerId: string;
  ownerEmail: string;
  name: string;
  slug: string;
  category: BusinessCategory;
  subscriptionStatus: SubscriptionStatus;
  plan: PlanId;
  trialEndsAt: Timestamp;
  onboardingCompleted: boolean;
  googleCalendarConnected: boolean;
  logoUrl?: string;
  faviconUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  whatsapp?: string;
  instagram?: string;
  facebookPixel?: string;
  libelulaSubscriptionId?: string;
  currentPeriodEnd?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface BusinessHoursDay {
  open: string;
  close: string;
  enabled: boolean;
}

export type BusinessHours = Record<
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday",
  BusinessHoursDay
>;

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  businessId: string;
  role: "owner" | "super_admin";
  onboardingCompleted: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

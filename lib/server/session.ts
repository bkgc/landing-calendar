import { cookies } from "next/headers";

import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";
import type { Business, UserProfile } from "@/types/business";

export interface ServerSession {
  uid: string;
  profile: UserProfile;
  business: Business;
}

export async function getServerSession(): Promise<ServerSession | null> {
  const token = (await cookies()).get("__session")?.value;
  if (!token) {
    return null;
  }

  try {
    const decoded = await getAdminAuth().verifySessionCookie(token, true);
    const profileSnapshot = await getAdminFirestore()
      .doc(`users/${decoded.uid}`)
      .get();
    if (!profileSnapshot.exists) {
      return null;
    }

    const profile = profileSnapshot.data() as UserProfile;
    const businessSnapshot = await getAdminFirestore()
      .doc(`businesses/${profile.businessId}`)
      .get();
    if (!businessSnapshot.exists) {
      return null;
    }

    const business = businessSnapshot.data() as Business;
    if (profile.role !== "super_admin" && business.ownerId !== decoded.uid) {
      return null;
    }

    return { uid: decoded.uid, profile, business };
  } catch {
    return null;
  }
}

export async function requireServerSession() {
  const session = await getServerSession();
  if (!session) {
    throw new Error("No autenticado.");
  }
  return session;
}

export function hasActiveSubscription(business: Business) {
  if (business.subscriptionStatus === "active") return true;
  if (business.subscriptionStatus !== "trialing") return false;
  const trialEndsAt = business.trialEndsAt as unknown as {
    toMillis?: () => number;
    seconds?: number;
  };
  const timestamp =
    trialEndsAt?.toMillis?.() ||
    (trialEndsAt?.seconds
      ? trialEndsAt.seconds * 1000
      : new Date(business.trialEndsAt as unknown as string).getTime());
  return timestamp > Date.now();
}

export async function requireEntitledSession() {
  const session = await requireServerSession();
  if (!hasActiveSubscription(session.business))
    throw new Error("SUBSCRIPTION_REQUIRED");
  return session;
}

import type { User } from "firebase/auth";
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import { getFirebaseFirestore } from "@/lib/firebase/config";
import type { Business, BusinessCategory, UserProfile } from "@/types/business";

export interface CompleteOnboardingInput {
  businessName: string;
  slug: string;
  category: BusinessCategory;
}

export class SlugUnavailableError extends Error {
  constructor() {
    super("Ese enlace ya está en uso. Elige otro para tu negocio.");
    this.name = "SlugUnavailableError";
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(doc(getFirebaseFirestore(), "users", userId));

  return snapshot.exists() ? (snapshot.data() as UserProfile) : null;
}

export async function getBusiness(businessId: string): Promise<Business | null> {
  const snapshot = await getDoc(doc(getFirebaseFirestore(), "businesses", businessId));

  return snapshot.exists() ? (snapshot.data() as Business) : null;
}

export async function isSlugAvailable(slug: string): Promise<boolean> {
  const snapshot = await getDoc(doc(getFirebaseFirestore(), "slugs", slug));

  return !snapshot.exists();
}

export async function completeOnboarding(
  user: User,
  input: CompleteOnboardingInput,
): Promise<Business> {
  const database = getFirebaseFirestore();
  const businessRef = doc(collection(database, "businesses"));
  const userRef = doc(database, "users", user.uid);
  const slugRef = doc(database, "slugs", input.slug);
  const trialEndsAt = Timestamp.fromMillis(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await runTransaction(database, async (transaction) => {
    const slugSnapshot = await transaction.get(slugRef);

    if (slugSnapshot.exists()) {
      throw new SlugUnavailableError();
    }

    const business: Omit<Business, "createdAt" | "updatedAt"> = {
      id: businessRef.id,
      ownerId: user.uid,
      ownerEmail: user.email ?? "",
      name: input.businessName,
      slug: input.slug,
      category: input.category,
      subscriptionStatus: "trialing",
      plan: "free",
      trialEndsAt,
      onboardingCompleted: true,
      googleCalendarConnected: false,
    };

    const profile: Omit<UserProfile, "createdAt" | "updatedAt"> = {
      id: user.uid,
      email: user.email ?? "",
      displayName: user.displayName ?? input.businessName,
      businessId: businessRef.id,
      role: "owner",
      onboardingCompleted: true,
    };

    transaction.set(businessRef, {
      ...business,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    transaction.set(userRef, {
      ...profile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    transaction.set(slugRef, {
      businessId: businessRef.id,
      ownerId: user.uid,
      createdAt: serverTimestamp(),
    });
  });

  return {
    id: businessRef.id,
    ownerId: user.uid,
    ownerEmail: user.email ?? "",
    name: input.businessName,
    slug: input.slug,
    category: input.category,
    subscriptionStatus: "trialing",
    plan: "free",
    trialEndsAt,
    onboardingCompleted: true,
    googleCalendarConnected: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
}

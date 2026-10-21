import { getAdminFirestore } from "@/lib/firebase/admin";
import { hasCurrentSubscription } from "@/lib/utils/subscription";
import { DEFAULT_LANDING_CONFIG, type LandingConfig } from "@/types/blocks";
import type { Business, BusinessHours } from "@/types/business";
import type { Service } from "@/types/service";
import type { StaffMember } from "@/types/staff";

export async function getPublicBusiness(slug: string) {
  if (!/^[a-z0-9-]{3,30}$/.test(slug)) {
    return null;
  }

  const database = getAdminFirestore();
  const slugSnapshot = await database.doc(`slugs/${slug}`).get();
  if (!slugSnapshot.exists) {
    return null;
  }

  const businessId = slugSnapshot.data()?.businessId as string | undefined;
  if (!businessId) {
    return null;
  }

  const businessSnapshot = await database.doc(`businesses/${businessId}`).get();
  if (!businessSnapshot.exists) {
    return null;
  }

  const [
    configSnapshot,
    servicesSnapshot,
    staffSnapshot,
    businessHoursSnapshot,
  ] = await Promise.all([
    database.doc(`businesses/${businessId}/landingConfig/config`).get(),
    database
      .collection(`businesses/${businessId}/services`)
      .where("active", "==", true)
      .get(),
    database
      .collection(`businesses/${businessId}/staff`)
      .where("active", "==", true)
      .get(),
    database.doc(`businesses/${businessId}/settings/businessHours`).get(),
  ]);

  const rawBusiness = businessSnapshot.data() as Business;
  const hasCurrentProSubscription =
    rawBusiness.plan === "pro" &&
    hasCurrentSubscription(
      rawBusiness.subscriptionStatus,
      rawBusiness.trialEndsAt,
      rawBusiness.currentPeriodEnd,
    );
  const business: Business = {
    id: businessId,
    name: rawBusiness.name,
    slug: rawBusiness.slug,
    plan: hasCurrentProSubscription ? "pro" : "free",
    subscriptionStatus: rawBusiness.subscriptionStatus,
    logoUrl: rawBusiness.logoUrl,
    faviconUrl: rawBusiness.faviconUrl,
    seoTitle: rawBusiness.seoTitle,
    seoDescription: rawBusiness.seoDescription,
    whatsapp: rawBusiness.whatsapp,
    instagram: rawBusiness.instagram,
    facebookPixel: rawBusiness.facebookPixel,
  } as Business;
  const rawConfig =
    (configSnapshot.exists ? configSnapshot.data() : DEFAULT_LANDING_CONFIG) ||
    DEFAULT_LANDING_CONFIG;
  const config = {
    theme: rawConfig.theme,
    blocks: rawConfig.blocks,
  } as LandingConfig;
  const services = servicesSnapshot.docs.map((document) => {
    const data = document.data() as Service;
    return {
      id: document.id,
      businessId,
      name: data.name,
      description: data.description,
      duration: data.duration,
      price: data.price,
      bufferTime: data.bufferTime,
      staffIds: data.staffIds,
      active: data.active,
    } satisfies Service;
  });
  const staff = staffSnapshot.docs.map((document) => {
    const data = document.data() as StaffMember;
    return {
      id: document.id,
      businessId,
      name: data.name,
      avatar: data.avatar,
      role: data.role,
      services: data.services || [],
      active: data.active,
    } satisfies StaffMember;
  });
  return {
    business: business as Business,
    businessHours: businessHoursSnapshot.data() as BusinessHours | undefined,
    config,
    services,
    staff,
  };
}

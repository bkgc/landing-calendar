import { getAdminFirestore } from "@/lib/firebase/admin";
import { DEFAULT_LANDING_CONFIG, type LandingConfig } from "@/types/blocks";
import type { Business } from "@/types/business";
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

  const [configSnapshot, servicesSnapshot, staffSnapshot] = await Promise.all([
    database.doc(`businesses/${businessId}/landingConfig/config`).get(),
    database
      .collection(`businesses/${businessId}/services`)
      .where("active", "==", true)
      .get(),
    database
      .collection(`businesses/${businessId}/staff`)
      .where("active", "==", true)
      .get(),
  ]);

  const rawBusiness = businessSnapshot.data() as Business;
  const {
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    trialEndsAt: _trialEndsAt,
    currentPeriodEnd: _currentPeriodEnd,
    ...business
  } = rawBusiness;
  const rawConfig =
    (configSnapshot.exists ? configSnapshot.data() : DEFAULT_LANDING_CONFIG) ||
    DEFAULT_LANDING_CONFIG;
  const config = {
    theme: rawConfig.theme,
    blocks: rawConfig.blocks,
  } as LandingConfig;
  const services = servicesSnapshot.docs.map((document) => {
    const data = document.data() as Service;
    const { createdAt: _created, updatedAt: _updated, ...publicService } = data;
    return publicService as Service;
  });
  const staff = staffSnapshot.docs.map((document) => {
    const data = document.data() as StaffMember;
    const { createdAt: _created, updatedAt: _updated, ...publicStaff } = data;
    return publicStaff as StaffMember;
  });
  return { business: business as Business, config, services, staff };
}

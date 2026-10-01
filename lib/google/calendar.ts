import { getAdminFirestore } from "@/lib/firebase/admin";

export async function getStaffCalendarId(businessId: string, staffId: string) {
  const snapshot = await getAdminFirestore()
    .doc(`businesses/${businessId}/staff/${staffId}`)
    .get();
  return (snapshot.data()?.googleCalendarId as string | undefined) || "primary";
}

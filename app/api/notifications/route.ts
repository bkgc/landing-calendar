import { getAdminFirestore } from "@/lib/firebase/admin";
import { ok, unknownError } from "@/lib/server/api";
import { requireServerSession } from "@/lib/server/session";

export async function GET() {
  try {
    const session = await requireServerSession();
    const snapshot = await getAdminFirestore()
      .collection(`businesses/${session.business.id}/notifications`)
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();
    return ok(
      snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      })),
    );
  } catch (error) {
    return unknownError(error);
  }
}

export async function PATCH() {
  try {
    const session = await requireServerSession();
    const snapshot = await getAdminFirestore()
      .collection(`businesses/${session.business.id}/notifications`)
      .where("read", "==", false)
      .get();
    const batch = getAdminFirestore().batch();
    snapshot.docs.forEach((document) =>
      batch.update(document.ref, { read: true }),
    );
    await batch.commit();
    return ok({ marked: snapshot.size });
  } catch (error) {
    return unknownError(error);
  }
}

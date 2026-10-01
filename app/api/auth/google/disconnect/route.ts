import { getAdminFirestore } from "@/lib/firebase/admin";
import { ok, unknownError } from "@/lib/server/api";
import { requireServerSession } from "@/lib/server/session";

export async function DELETE() {
  try {
    const session = await requireServerSession();
    await Promise.all([
      getAdminFirestore()
        .doc(`businesses/${session.business.id}/integrations/google`)
        .delete(),
      getAdminFirestore()
        .doc(`businesses/${session.business.id}`)
        .update({ googleCalendarConnected: false, updatedAt: new Date() }),
    ]);
    return ok({ disconnected: true });
  } catch (error) {
    return unknownError(error);
  }
}

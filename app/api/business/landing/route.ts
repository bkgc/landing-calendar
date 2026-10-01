import { getAdminFirestore } from "@/lib/firebase/admin";
import { fail, ok, unknownError } from "@/lib/server/api";
import {
  requireEntitledSession,
  requireServerSession,
} from "@/lib/server/session";
import { DEFAULT_LANDING_CONFIG, type LandingConfig } from "@/types/blocks";
import { landingConfigSchema } from "@/lib/server/landing-validation";

export async function GET() {
  try {
    const session = await requireEntitledSession();
    const snapshot = await getAdminFirestore()
      .doc(`businesses/${session.business.id}/landingConfig/config`)
      .get();
    return ok(snapshot.exists ? snapshot.data() : DEFAULT_LANDING_CONFIG);
  } catch (error) {
    return unknownError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireEntitledSession();
    const body = await request.json();
    const parsed = landingConfigSchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const errorMsg = firstIssue
        ? `Error en ${firstIssue.path.join(".") || "configuración"}: ${firstIssue.message}`
        : "La configuración del landing no es válida.";
      return fail(errorMsg, 400);
    }
    const payload = parsed.data as LandingConfig;

    await getAdminFirestore()
      .doc(`businesses/${session.business.id}/landingConfig/config`)
      .set({ ...payload, updatedAt: new Date() });
    return ok(payload);
  } catch (error) {
    return unknownError(error);
  }
}

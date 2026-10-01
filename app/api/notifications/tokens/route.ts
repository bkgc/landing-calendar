import { z } from "zod";

import { getAdminFirestore } from "@/lib/firebase/admin";
import { fail, ok, unknownError } from "@/lib/server/api";
import { requireServerSession } from "@/lib/server/session";

const tokenSchema = z.object({ token: z.string().min(20) });

export async function POST(request: Request) {
  try {
    const session = await requireServerSession();
    if (session.business.plan !== "pro")
      return fail(
        "Las notificaciones push están disponibles en el plan Pro.",
        403,
      );
    const input = tokenSchema.safeParse(await request.json());
    if (!input.success) return fail("Token inválido.");
    const tokenId = Buffer.from(input.data.token)
      .toString("base64url")
      .slice(0, 120);
    await getAdminFirestore()
      .doc(`users/${session.uid}/fcmTokens/${tokenId}`)
      .set({ token: input.data.token, updatedAt: new Date() });
    return ok({ saved: true });
  } catch (error) {
    return unknownError(error);
  }
}

import { z } from "zod";

import { getAdminFirestore } from "@/lib/firebase/admin";
import { fail, ok, unknownError } from "@/lib/server/api";
import { requireEntitledSession } from "@/lib/server/session";

const staffPatch = z.object({
  name: z.string().trim().min(2).optional(),
  avatar: z.string().url().optional().or(z.literal("")),
  role: z.string().trim().min(2).optional(),
  email: z.string().email().optional().or(z.literal("")),
  googleCalendarId: z.string().optional(),
  services: z.array(z.string()).optional(),
  active: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ staffId: string }> },
) {
  try {
    const session = await requireEntitledSession();
    const { staffId } = await params;
    const input = staffPatch.safeParse(await request.json());
    if (!input.success)
      return fail(input.error.issues[0]?.message || "Datos inválidos.");
    await getAdminFirestore()
      .doc(`businesses/${session.business.id}/staff/${staffId}`)
      .update({ ...input.data, updatedAt: new Date() });
    return ok({ id: staffId, ...input.data });
  } catch (error) {
    return unknownError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ staffId: string }> },
) {
  try {
    const session = await requireEntitledSession();
    const { staffId } = await params;
    await getAdminFirestore()
      .doc(`businesses/${session.business.id}/staff/${staffId}`)
      .delete();
    return ok({ id: staffId });
  } catch (error) {
    return unknownError(error);
  }
}

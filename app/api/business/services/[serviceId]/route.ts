import { z } from "zod";

import { getAdminFirestore } from "@/lib/firebase/admin";
import { fail, ok, unknownError } from "@/lib/server/api";
import { requireEntitledSession } from "@/lib/server/session";

const servicePatch = z.object({
  name: z.string().trim().min(2).optional(),
  description: z.string().optional(),
  duration: z.number().int().min(15).max(480).optional(),
  price: z.number().min(0).optional(),
  bufferTime: z.number().int().min(0).max(120).optional(),
  staffIds: z.array(z.string()).optional(),
  active: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ serviceId: string }> },
) {
  try {
    const session = await requireEntitledSession();
    const { serviceId } = await params;
    const input = servicePatch.safeParse(await request.json());
    if (!input.success)
      return fail(input.error.issues[0]?.message || "Datos inválidos.");
    const reference = getAdminFirestore().doc(
      `businesses/${session.business.id}/services/${serviceId}`,
    );
    await reference.update({ ...input.data, updatedAt: new Date() });
    return ok({ id: serviceId, ...input.data });
  } catch (error) {
    return unknownError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ serviceId: string }> },
) {
  try {
    const session = await requireEntitledSession();
    const { serviceId } = await params;
    await getAdminFirestore()
      .doc(`businesses/${session.business.id}/services/${serviceId}`)
      .delete();
    return ok({ id: serviceId });
  } catch (error) {
    return unknownError(error);
  }
}

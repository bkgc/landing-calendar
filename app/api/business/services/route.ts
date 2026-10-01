import { z } from "zod";

import { getAdminFirestore } from "@/lib/firebase/admin";
import { fail, ok, unknownError } from "@/lib/server/api";
import { requireEntitledSession } from "@/lib/server/session";

const serviceSchema = z.object({
  name: z.string().trim().min(2),
  description: z.string().default(""),
  duration: z.number().int().min(15).max(480),
  price: z.number().min(0),
  bufferTime: z.number().int().min(0).max(120).default(0),
  staffIds: z.array(z.string()).default([]),
  active: z.boolean().default(true),
});

export async function GET() {
  try {
    const session = await requireEntitledSession();
    const snapshot = await getAdminFirestore()
      .collection(`businesses/${session.business.id}/services`)
      .orderBy("createdAt", "desc")
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

export async function POST(request: Request) {
  try {
    const session = await requireEntitledSession();
    const input = serviceSchema.safeParse(await request.json());
    if (!input.success)
      return fail(input.error.issues[0]?.message || "Datos inválidos.");
    const database = getAdminFirestore();
    if (session.business.plan === "free") {
      const count = (
        await database
          .collection(`businesses/${session.business.id}/services`)
          .where("active", "==", true)
          .get()
      ).size;
      if (count >= 5)
        return fail("El plan Free permite hasta 5 servicios.", 403);
    }
    const reference = database
      .collection(`businesses/${session.business.id}/services`)
      .doc();

    let staffIds = input.data.staffIds;
    if (!staffIds || staffIds.length === 0) {
      const staffDocs = await database
        .collection(`businesses/${session.business.id}/staff`)
        .where("active", "==", true)
        .get();
      staffIds = staffDocs.docs.map((doc) => doc.id);
    }

    const data = {
      ...input.data,
      staffIds,
      businessId: session.business.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await reference.set(data);
    return ok({ id: reference.id, ...data }, 201);
  } catch (error) {
    return unknownError(error);
  }
}

import { z } from "zod";

import { getAdminFirestore } from "@/lib/firebase/admin";
import { fail, ok, unknownError } from "@/lib/server/api";
import { requireEntitledSession } from "@/lib/server/session";

const staffSchema = z.object({
  name: z.string().trim().min(2),
  avatar: z.string().url().optional().or(z.literal("")),
  role: z.string().trim().min(2),
  email: z.string().email().optional().or(z.literal("")),
  googleCalendarId: z.string().default("primary"),
  services: z.array(z.string()).default([]),
  active: z.boolean().default(true),
});

export async function GET() {
  try {
    const session = await requireEntitledSession();
    const snapshot = await getAdminFirestore()
      .collection(`businesses/${session.business.id}/staff`)
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
    const input = staffSchema.safeParse(await request.json());
    if (!input.success)
      return fail(input.error.issues[0]?.message || "Datos inválidos.");
    const database = getAdminFirestore();
    if (session.business.plan === "free") {
      const count = (
        await database
          .collection(`businesses/${session.business.id}/staff`)
          .where("active", "==", true)
          .get()
      ).size;
      if (count >= 1)
        return fail("El plan Free permite un integrante de equipo.", 403);
    }
    const reference = database
      .collection(`businesses/${session.business.id}/staff`)
      .doc();
    const data = {
      ...input.data,
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

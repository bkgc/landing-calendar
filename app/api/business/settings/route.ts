import { z } from "zod";

import { getAdminFirestore } from "@/lib/firebase/admin";
import { fail, ok, unknownError } from "@/lib/server/api";
import { requireServerSession } from "@/lib/server/session";

const settingsSchema = z.object({
  name: z.string().trim().min(2).optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  faviconUrl: z.string().url().optional().or(z.literal("")),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
  whatsapp: z.string().max(30).optional(),
  instagram: z.string().url().optional().or(z.literal("")),
  facebookPixel: z.string().max(40).optional(),
  businessHours: z
    .record(
      z.string(),
      z.object({ open: z.string(), close: z.string(), enabled: z.boolean() }),
    )
    .optional(),
});

export async function GET() {
  try {
    const session = await requireServerSession();
    const [businessSnapshot, hoursSnapshot] = await Promise.all([
      getAdminFirestore().doc(`businesses/${session.business.id}`).get(),
      getAdminFirestore()
        .doc(`businesses/${session.business.id}/settings/businessHours`)
        .get(),
    ]);
    return ok({
      business: businessSnapshot.data(),
      businessHours: hoursSnapshot.data() || {},
    });
  } catch (error) {
    return unknownError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireServerSession();
    const input = settingsSchema.safeParse(await request.json());
    if (!input.success)
      return fail(input.error.issues[0]?.message || "Datos inválidos.");
    const { businessHours, ...business } = input.data;
    if (Object.keys(business).length)
      await getAdminFirestore()
        .doc(`businesses/${session.business.id}`)
        .update({ ...business, updatedAt: new Date() });
    if (businessHours)
      await getAdminFirestore()
        .doc(`businesses/${session.business.id}/settings/businessHours`)
        .set(businessHours);
    return ok(input.data);
  } catch (error) {
    return unknownError(error);
  }
}

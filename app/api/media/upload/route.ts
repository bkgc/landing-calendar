import { randomUUID } from "node:crypto";

import { getAdminStorage } from "@/lib/firebase/admin";
import { fail, ok, unknownError } from "@/lib/server/api";
import { requireEntitledSession } from "@/lib/server/session";

const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const session = await requireEntitledSession();
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || !file.type.startsWith("image/"))
      return fail("Solo se permiten imágenes.");
    if (file.size > MAX_SIZE) return fail("La imagen no puede superar 5 MB.");
    const bucket = getAdminStorage().bucket(
      process.env.FIREBASE_STORAGE_BUCKET ||
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    );
    const path = `businesses/${session.business.id}/media/${randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const token = randomUUID();
    await bucket
      .file(path)
      .save(Buffer.from(await file.arrayBuffer()), {
        metadata: {
          contentType: file.type,
          metadata: { firebaseStorageDownloadTokens: token },
        },
      });
    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
    return ok({ url });
  } catch (error) {
    return unknownError(error);
  }
}

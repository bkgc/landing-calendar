import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { getAdminFirestore } from "@/lib/firebase/admin";
import { getGoogleOAuthClient } from "@/lib/google/client";
import { getServerSession } from "@/lib/server/session";
import { encrypt } from "@/lib/utils/encrypt";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const errorParam = request.nextUrl.searchParams.get("error");

  if (errorParam) {
    return NextResponse.redirect(
      new URL(
        `/dashboard/settings?google=error&detail=${encodeURIComponent(errorParam)}`,
        request.url,
      ),
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL(
        "/dashboard/settings?google=error&detail=Parametros+de+autorizacion+faltantes",
        request.url,
      ),
    );
  }

  try {
    let payload: {
      businessId: string;
      uid: string;
      timestamp?: number;
      redirectUri?: string;
    };

    const separator = state.lastIndexOf(".");
    if (separator < 1 || !process.env.GOOGLE_CLIENT_SECRET) {
      throw new Error("El estado OAuth firmado es inválido.");
    }
    const encodedData = state.slice(0, separator);
    const signature = state.slice(separator + 1);
    const raw = Buffer.from(encodedData, "base64url").toString("utf8");
    const expectedSig = createHmac("sha256", process.env.GOOGLE_CLIENT_SECRET)
      .update(raw)
      .digest("hex");
    const expectedSignature = Buffer.from(expectedSig, "hex");
    const actualSignature = Buffer.from(signature, "hex");
    if (
      actualSignature.length !== expectedSignature.length ||
      !timingSafeEqual(expectedSignature, actualSignature)
    ) {
      throw new Error("La firma criptográfica del estado OAuth es inválida.");
    }

    payload = JSON.parse(raw) as {
      businessId: string;
      uid: string;
      timestamp: number;
      redirectUri?: string;
    };
    if (
      !payload.businessId ||
      !payload.uid ||
      typeof payload.timestamp !== "number" ||
      !Number.isFinite(payload.timestamp) ||
      payload.timestamp > Date.now() + 5 * 60 * 1000 ||
      Date.now() - payload.timestamp > 30 * 60 * 1000
    ) {
      throw new Error("La sesión de vinculación ha expirado. Intenta de nuevo.");
    }

    // Verificar negocio en Firestore
    const database = getAdminFirestore();
    const businessDoc = await database.doc(`businesses/${payload.businessId}`).get();
    if (!businessDoc.exists) {
      throw new Error("No se encontró el negocio para vincular.");
    }
    if (businessDoc.data()?.ownerId !== payload.uid) {
      throw new Error("La cuenta no es propietaria del negocio solicitado.");
    }

    // Si la sesión de servidor sigue viva en cookies, verificar consistencia
    const session = await getServerSession();
    if (
      !session ||
      session.uid !== payload.uid ||
      session.business.id !== payload.businessId
    ) {
      throw new Error("La sesión activa no coincide con el negocio que solicitó la vinculación.");
    }

    const redirectUri =
      payload.redirectUri ||
      process.env.GOOGLE_REDIRECT_URI ||
      `${request.nextUrl.origin}/api/auth/google/callback`;

    const client = getGoogleOAuthClient(redirectUri);
    const { tokens } = await client.getToken(code);

    if (!tokens.access_token) {
      throw new Error("Google no devolvió un access_token válido.");
    }

    const integrationRef = database.doc(
      `businesses/${payload.businessId}/integrations/google`,
    );
    const existingDoc = await integrationRef.get();
    const existingData = existingDoc.data();

    // Si Google no devuelve refresh_token (porque ya se otorgó previamente), usar el existente
    const finalRefreshToken =
      tokens.refresh_token ||
      (existingData?.refreshToken ? existingData.refreshToken : null);

    if (!finalRefreshToken) {
      throw new Error(
        "Google no devolvió refresh_token. Ve a tu cuenta de Google -> Seguridad -> Apps con acceso y desvincula AgendaPro para volver a conectar.",
      );
    }

    await integrationRef.set({
      accessToken: encrypt(tokens.access_token),
      refreshToken: tokens.refresh_token
        ? encrypt(tokens.refresh_token)
        : finalRefreshToken,
      expiryDate: tokens.expiry_date || Date.now() + 3_600_000,
      updatedAt: new Date(),
    });

    await database
      .doc(`businesses/${payload.businessId}`)
      .update({ googleCalendarConnected: true, updatedAt: new Date() });

    return NextResponse.redirect(
      new URL("/dashboard/settings?google=connected", request.url),
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error inesperado al conectar Google";
    return NextResponse.redirect(
      new URL(
        `/dashboard/settings?google=error&detail=${encodeURIComponent(message)}`,
        request.url,
      ),
    );
  }
}

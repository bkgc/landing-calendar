import { createHmac } from "node:crypto";
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

  const expectedState = request.cookies.get("google_oauth_state")?.value;
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

    // Validar estado firmado con HMAC
    if (state.includes(".")) {
      const [encodedData, signature] = state.split(".");
      const raw = Buffer.from(encodedData, "base64url").toString("utf8");
      const secret = process.env.GOOGLE_CLIENT_SECRET || "";
      const expectedSig = createHmac("sha256", secret)
        .update(raw)
        .digest("hex");

      if (signature !== expectedSig) {
        throw new Error("La firma criptográfica del estado OAuth es inválida.");
      }

      payload = JSON.parse(raw);

      if (payload.timestamp && Date.now() - payload.timestamp > 30 * 60 * 1000) {
        throw new Error("La sesión de vinculación ha expirado. Intenta de nuevo.");
      }
    } else {
      // Compatibilidad con estado simple
      payload = JSON.parse(
        Buffer.from(state, "base64url").toString("utf8"),
      ) as { businessId: string; uid: string; redirectUri?: string };

      if (expectedState && state !== expectedState) {
        throw new Error("El estado de sesión OAuth no coincide.");
      }
    }

    // Verificar negocio en Firestore
    const database = getAdminFirestore();
    const businessDoc = await database.doc(`businesses/${payload.businessId}`).get();
    if (!businessDoc.exists) {
      throw new Error("No se encontró el negocio para vincular.");
    }

    // Si la sesión de servidor sigue viva en cookies, verificar consistencia
    const session = await getServerSession();
    if (session && session.business.id !== payload.businessId) {
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

    const response = NextResponse.redirect(
      new URL("/dashboard/settings?google=connected", request.url),
    );
    response.cookies.set("google_oauth_state", "", { maxAge: 0, path: "/" });
    return response;
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

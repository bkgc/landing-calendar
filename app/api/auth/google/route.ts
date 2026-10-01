import { createHmac, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import { getGoogleOAuthClient, GOOGLE_SCOPES } from "@/lib/google/client";
import { requireServerSession } from "@/lib/server/session";

export async function GET(request: Request) {
  try {
    const session = await requireServerSession();

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return NextResponse.redirect(
        new URL(
          "/dashboard/settings?google=missing_credentials",
          request.url,
        ),
      );
    }

    const url = new URL(request.url);
    const host = request.headers.get("x-forwarded-host") || url.host;
    const proto =
      request.headers.get("x-forwarded-proto") ||
      (host.includes("localhost") || host.includes("127.0.0.1")
        ? "http"
        : "https");
    const currentOrigin = `${proto}://${host}`;

    const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
    const redirectUri = isLocal
      ? `${currentOrigin}/api/auth/google/callback`
      : process.env.GOOGLE_REDIRECT_URI ||
        `${currentOrigin}/api/auth/google/callback`;

    const client = getGoogleOAuthClient(redirectUri);
    const rawState = JSON.stringify({
      businessId: session.business.id,
      uid: session.uid,
      nonce: randomUUID(),
      timestamp: Date.now(),
      redirectUri,
    });

    const signature = createHmac("sha256", process.env.GOOGLE_CLIENT_SECRET)
      .update(rawState)
      .digest("hex");

    const state = `${Buffer.from(rawState).toString("base64url")}.${signature}`;

    const authUrl = client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: GOOGLE_SCOPES,
      state,
    });

    const response = NextResponse.redirect(authUrl);
    response.cookies.set("google_oauth_state", state, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 900,
      path: "/",
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al iniciar OAuth";
    return NextResponse.redirect(
      new URL(
        `/dashboard/settings?google=error&detail=${encodeURIComponent(message)}`,
        request.url,
      ),
    );
  }
}

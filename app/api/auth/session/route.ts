import { NextRequest, NextResponse } from "next/server";

import { getAdminAuth } from "@/lib/firebase/admin";
import { fail, ok, unknownError } from "@/lib/server/api";
import { getServerSession, hasActiveSubscription } from "@/lib/server/session";

export async function GET() {
  const session = await getServerSession();
  if (!session) return fail("No autenticado.", 401);
  return ok({
    authenticated: true,
    business: {
      id: session.business.id,
      subscriptionStatus: session.business.subscriptionStatus,
      plan: session.business.plan,
      entitled: hasActiveSubscription(session.business),
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const token = authorization?.replace(/^Bearer\s+/i, "");
    if (!token) {
      return fail("Falta el token de sesión.", 401);
    }

    const sessionCookie = await getAdminAuth().createSessionCookie(token, {
      expiresIn: 60 * 60 * 24 * 5 * 1000,
    });
    const response = ok({ authenticated: true });
    response.cookies.set("__session", sessionCookie, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 5,
      path: "/",
    });
    return response;
  } catch (error) {
    return unknownError(error);
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("__session", "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });
  return response;
}

import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  if (!request.cookies.has("__session")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const billingRoute =
    request.nextUrl.pathname.startsWith("/dashboard/billing");
  const settingsRoute = request.nextUrl.pathname.startsWith(
    "/dashboard/settings",
  );
  if (!billingRoute && !settingsRoute) {
    try {
      const sessionResponse = await fetch(
        new URL("/api/auth/session", request.url),
        {
          headers: { cookie: request.headers.get("cookie") || "" },
        },
      );
      const sessionResult = (await sessionResponse.json()) as {
        data?: { business?: { entitled?: boolean } };
      };
      if (!sessionResult.data?.business?.entitled) {
        return NextResponse.redirect(
          new URL("/dashboard/billing", request.url),
        );
      }
    } catch {
      // El layout y las rutas API vuelven a verificar la sesión si el fetch no responde.
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

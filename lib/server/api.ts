import { NextResponse } from "next/server";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function unknownError(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Ocurrió un error inesperado.";
  if (message === "No autenticado.") return fail(message, 401);
  if (message === "SUBSCRIPTION_REQUIRED")
    return fail(
      "Tu prueba gratuita terminó. Activa un plan para continuar.",
      402,
    );
  return fail("Ocurrió un error inesperado. Intenta nuevamente.", 500);
}

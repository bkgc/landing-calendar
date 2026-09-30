import { Suspense } from "react";

import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthPageShell subtitle="Ingresa para administrar tu negocio." title="Bienvenido de nuevo">
      <Suspense fallback={<p className="text-sm text-default-500">Cargando acceso…</p>}>
        <LoginForm />
      </Suspense>
    </AuthPageShell>
  );
}

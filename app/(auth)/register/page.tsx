import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthPageShell subtitle="Crea tu cuenta y deja lista tu agenda en minutos." title="Crea tu negocio">
      <RegisterForm />
    </AuthPageShell>
  );
}

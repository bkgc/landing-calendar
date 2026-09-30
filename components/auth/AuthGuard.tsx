"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Card, CardBody, Spinner } from "@/components/ui";
import { useAuth } from "@/lib/hooks/useAuth";

interface AuthGuardProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export function AuthGuard({ children, requireOnboarding = true }: AuthGuardProps) {
  const { configError, loading, profile, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading || configError) {
      return;
    }

    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (requireOnboarding && !profile?.onboardingCompleted) {
      router.replace("/onboarding");
    }
  }, [configError, loading, pathname, profile?.onboardingCompleted, router, user]);

  if (configError) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl items-center px-6">
        <Card className="w-full">
          <CardBody className="gap-2 p-6">
            <p className="text-lg font-semibold">Configura Firebase para continuar</p>
            <p className="text-sm text-default-500">{configError}</p>
          </CardBody>
        </Card>
      </main>
    );
  }

  if (loading || !user || (requireOnboarding && !profile?.onboardingCompleted)) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Spinner label="Cargando tu espacio…" />
      </main>
    );
  }

  return <>{children}</>;
}

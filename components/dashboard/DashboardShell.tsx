"use client";

import { signOut } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui";
import { getFirebaseAuth } from "@/lib/firebase/config";
import { useAuth } from "@/lib/hooks/useAuth";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { business, user } = useAuth();
  const router = useRouter();

  const logout = async () => {
    await signOut(getFirebaseAuth());
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-default-50">
      <header className="border-b border-default-200 bg-content1">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-5">
          <Link className="text-lg font-bold" href="/dashboard">
            AgendaPro
          </Link>
          <div className="flex items-center gap-3">
            <p className="hidden text-sm text-default-500 sm:block">{business?.name}</p>
            <Button size="sm" variant="flat" onPress={() => void logout()}>
              Salir
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8">{children}</main>
    </div>
  );
}

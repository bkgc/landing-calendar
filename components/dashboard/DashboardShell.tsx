"use client";

import { signOut } from "firebase/auth";
import {
  CalendarDays,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Palette,
  Settings2,
  Users,
  WalletCards,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentType } from "react";

import { Logo } from "@/components/icons";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { Avatar, Button, Chip } from "@/components/ui";
import { getFirebaseAuth } from "@/lib/firebase/config";
import { useAuth } from "@/lib/hooks/useAuth";

interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Resumen", icon: LayoutDashboard },
  { href: "/dashboard/editor", label: "Editor de landing", icon: Palette },
  { href: "/dashboard/services", label: "Servicios", icon: Wrench },
  { href: "/dashboard/staff", label: "Equipo", icon: Users },
  { href: "/dashboard/appointments", label: "Citas", icon: CalendarDays },
  { href: "/dashboard/billing", label: "Suscripción", icon: WalletCards },
  { href: "/dashboard/settings", label: "Ajustes", icon: Settings2 },
];

function isActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { business, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const firstName = user?.displayName?.split(" ")[0] || "Cuenta";

  const logout = async () => {
    await signOut(getFirebaseAuth());
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-[var(--app-canvas)] text-[var(--app-ink)]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-[var(--app-line)] bg-white lg:flex">
        <div className="flex h-20 items-center gap-3 border-b border-[var(--app-line)] px-6">
          <span className="flex size-9 items-center justify-center rounded-xl bg-[var(--app-primary)] text-white">
            <Logo size={23} />
          </span>
          <div>
            <p className="font-semibold tracking-tight">AgendaPro</p>
            <p className="text-[11px] text-[var(--app-muted)]">
              Panel de negocio
            </p>
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-between p-4">
          <nav className="space-y-1" aria-label="Navegación principal">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);
              return (
                <Button
                  key={item.href}
                  as={Link}
                  className={`w-full justify-start gap-3 px-3 ${active ? "bg-[var(--app-primary-soft)] text-[var(--app-primary)]" : "text-[var(--app-muted)]"}`}
                  href={item.href}
                  startContent={
                    <Icon size={18} strokeWidth={active ? 2.4 : 2} />
                  }
                  variant="light"
                >
                  {item.label}
                </Button>
              );
            })}
          </nav>
          <div className="space-y-3">
            <div className="rounded-xl border border-[var(--app-line)] bg-[var(--app-canvas)] p-3">
              <p className="truncate text-sm font-medium">
                {business?.name || "Tu negocio"}
              </p>
              <p className="mt-1 text-xs text-[var(--app-muted)]">
                /{business?.slug || "tu-enlace"}
              </p>
            </div>
            <Button
              className="w-full justify-start gap-3 px-3 text-[var(--app-muted)]"
              startContent={<LogOut size={18} />}
              variant="light"
              onPress={() => void logout()}
            >
              Cerrar sesión
            </Button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-[var(--app-line)] bg-white/95 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-4 px-5 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <Link
                className="flex items-center gap-2 lg:hidden"
                href="/dashboard"
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--app-primary)] text-white">
                  <Logo size={19} />
                </span>
                <span className="font-semibold">AgendaPro</span>
              </Link>
              <div className="hidden min-w-0 sm:block">
                <p className="truncate text-sm font-medium">
                  {business?.name || "Tu negocio"}
                </p>
                <p className="text-xs text-[var(--app-muted)]">
                  Espacio de trabajo
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <div className="hidden h-7 w-px bg-[var(--app-line)] sm:block" />
              <Avatar
                className="shrink-0"
                name={firstName.slice(0, 1)}
                size="sm"
              />
              <span className="hidden max-w-28 truncate text-sm font-medium sm:block">
                {firstName}
              </span>
              <Button
                isIconOnly
                aria-label="Cerrar sesión"
                className="text-[var(--app-muted)] lg:hidden"
                variant="light"
                onPress={() => void logout()}
              >
                <LogOut size={18} />
              </Button>
            </div>
          </div>
          <nav
            aria-label="Navegación móvil"
            className="grid grid-cols-4 gap-1 border-t border-[var(--app-line)] px-2 py-2 lg:hidden"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);
              return (
                <Button
                  key={item.href}
                  as={Link}
                  className="h-auto min-w-0 flex-col gap-1 px-1 py-2 text-[10px]"
                  color={active ? "primary" : "default"}
                  href={item.href}
                  size="sm"
                  startContent={<Icon size={16} />}
                  variant={active ? "flat" : "light"}
                >
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </header>
        <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-[1440px] px-5 py-7 lg:px-8 lg:py-9">
          {children}
        </main>
      </div>
    </div>
  );
}

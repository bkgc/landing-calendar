"use client";

import { Bell, Check } from "lucide-react";
import { useState } from "react";

import { Button, Card, CardBody, CardHeader } from "@/components/ui";
import { useFCM } from "@/lib/hooks/useFCM";

export default function NotificationSettingsPage() {
  const { enable, enabled, loading } = useFCM();
  const [message, setMessage] = useState<string | null>(null);

  const activate = async () => {
    const result = await enable();
    setMessage(
      result
        ? "Notificaciones activadas."
        : "El navegador no concedió el permiso.",
    );
  };

  return (
    <section className="max-w-2xl space-y-7">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--app-primary)]">
          Configuración
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Notificaciones</h1>
        <p className="mt-2 text-[var(--app-muted)]">
          Recibe un aviso instantáneo cada vez que alguien reserve.
        </p>
      </div>
      <Card className="border border-[var(--app-line)] shadow-none">
        <CardHeader className="gap-3 px-6 pb-0 pt-6">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
            <Bell size={18} />
          </span>
          <div>
            <p className="font-semibold">Push para nuevas citas</p>
            <p className="text-sm text-[var(--app-muted)]">
              Funciona en este navegador y en tus dispositivos autorizados.
            </p>
          </div>
        </CardHeader>
        <CardBody className="gap-4 p-6">
          <Button
            color={enabled ? "success" : "primary"}
            isLoading={loading}
            startContent={enabled ? <Check size={16} /> : <Bell size={16} />}
            variant={enabled ? "flat" : "solid"}
            onPress={() => void activate()}
          >
            {enabled ? "Notificaciones activas" : "Activar notificaciones"}
          </Button>
          {message ? (
            <p className="text-sm text-[var(--app-muted)]">{message}</p>
          ) : null}
        </CardBody>
      </Card>
    </section>
  );
}

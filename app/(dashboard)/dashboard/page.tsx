"use client";

import Link from "next/link";

import { Button, Card, CardBody, CardHeader } from "@/components/ui";
import { useAuth } from "@/lib/hooks/useAuth";

export default function DashboardPage() {
  const { business, user } = useAuth();
  const trialEnd = business?.trialEndsAt.toDate().toLocaleDateString("es-BO", {
    day: "numeric",
    month: "long",
  });

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Panel principal</p>
        <h1 className="text-3xl font-bold">Hola, {user?.displayName?.split(" ")[0] ?? ""}</h1>
        <p className="text-default-500">Tu espacio de AgendaPro ya está listo para configurarse.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-0 text-lg font-semibold">Prueba gratuita</CardHeader>
          <CardBody className="gap-2">
            <p className="text-2xl font-bold">Plan Free</p>
            <p className="text-sm text-default-500">Activa hasta {trialEnd ?? ""} tus primeras reservas.</p>
            <Button as={Link} className="w-fit" color="primary" href="/dashboard/billing">
              Ver planes
            </Button>
          </CardBody>
        </Card>
        <Card>
          <CardHeader className="pb-0 text-lg font-semibold">Próximo paso</CardHeader>
          <CardBody className="gap-2">
            <p className="font-medium">Conecta tu Google Calendar</p>
            <p className="text-sm text-default-500">
              La sincronización de disponibilidad se agregará en el siguiente módulo.
            </p>
          </CardBody>
        </Card>
      </div>
    </section>
  );
}

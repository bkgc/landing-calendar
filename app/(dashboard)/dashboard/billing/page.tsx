"use client";

import { Card, CardBody, CardHeader } from "@/components/ui";
import { useAuth } from "@/lib/hooks/useAuth";

export default function BillingPage() {
  const { business } = useAuth();
  const trialEnd = business?.trialEndsAt.toDate().toLocaleDateString("es-BO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section className="max-w-3xl space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Facturación</p>
        <h1 className="mt-2 text-3xl font-bold">Tu suscripción</h1>
      </div>
      <Card>
        <CardHeader className="pb-0 text-lg font-semibold">Plan Free</CardHeader>
        <CardBody className="gap-2">
          <p className="text-default-600">Tu periodo de prueba finaliza el {trialEnd ?? ""}.</p>
          <p className="text-sm text-default-500">
            Los planes Pro y el pago mediante Libélula se habilitarán en el módulo de facturación.
          </p>
        </CardBody>
      </Card>
    </section>
  );
}

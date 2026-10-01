"use client";

import { Clock3, Coins, Edit3, Plus, Trash2, Wrench } from "lucide-react";
import { useEffect, useState } from "react";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { ServiceForm } from "@/components/dashboard/ServiceForm";
import type { Service } from "@/types/service";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    const response = await fetch("/api/business/services");
    const result = await response.json();
    if (result.success) setServices(result.data);
  };

  useEffect(() => {
    void load();
  }, []);

  const confirmRemove = async () => {
    if (!serviceToDelete) return;
    setDeleting(true);
    try {
      await fetch(`/api/business/services/${serviceToDelete.id}`, { method: "DELETE" });
      if (editingService?.id === serviceToDelete.id) {
        setEditingService(null);
      }
      setServiceToDelete(null);
      await load();
    } finally {
      setDeleting(false);
    }
  };

  const toggleActive = async (service: Service) => {
    await fetch(`/api/business/services/${service.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !service.active }),
    });
    await load();
  };

  return (
    <section className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--app-primary)]">
            Catálogo
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
            Servicios
          </h1>
          <p className="mt-2 text-[var(--app-muted)]">
            Lo que tus clientes pueden reservar desde tu página.
          </p>
        </div>
        <div className="flex gap-2">
          <Chip color="primary" variant="flat">
            {services.filter((s) => s.active).length} activos
          </Chip>
          {services.some((s) => !s.active) && (
            <Chip color="default" variant="flat">
              {services.filter((s) => !s.active).length} inactivos
            </Chip>
          )}
        </div>
      </div>
      <div className="grid items-start gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card className="border border-[var(--app-line)] shadow-none">
          <CardHeader className="gap-3 px-5 pb-0 pt-5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
              {editingService ? <Edit3 size={18} /> : <Plus size={18} />}
            </span>
            <div>
              <p className="font-semibold">
                {editingService ? "Editar servicio" : "Nuevo servicio"}
              </p>
              <p className="text-xs text-[var(--app-muted)]">
                {editingService
                  ? `Modificando: ${editingService.name}`
                  : "Aparecerá en tu agenda pública."}
              </p>
            </div>
          </CardHeader>
          <CardBody className="p-5">
            <ServiceForm
              editingService={editingService}
              onCancel={() => setEditingService(null)}
              onCreated={async () => {
                setEditingService(null);
                await load();
              }}
            />
          </CardBody>
        </Card>
        <div className="grid gap-4 md:grid-cols-2">
          {services.length ? (
            services.map((service) => (
              <Card
                className={`border shadow-none transition-colors ${
                  editingService?.id === service.id
                    ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)]/20"
                    : "border-[var(--app-line)]"
                }`}
                key={service.id}
              >
                <CardBody className="gap-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#fff0e8] text-[#c85f3f]">
                        <Wrench size={18} />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h2 className="truncate font-semibold">
                            {service.name}
                          </h2>
                          {!service.active && (
                            <Chip size="sm" variant="flat" color="warning">
                              Pausado
                            </Chip>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-[var(--app-muted)]">
                          {service.description || "Sin descripción"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        isIconOnly
                        aria-label={`Editar ${service.name}`}
                        color="primary"
                        size="sm"
                        variant={editingService?.id === service.id ? "solid" : "light"}
                        onPress={() => setEditingService(service)}
                      >
                        <Edit3 size={15} />
                      </Button>
                      <Button
                        isIconOnly
                        aria-label={`Eliminar ${service.name}`}
                        color="danger"
                        size="sm"
                        variant="light"
                        onPress={() => setServiceToDelete(service)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--app-line)] pt-3 text-sm text-[var(--app-muted)]">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5">
                        <Clock3 size={15} />
                        {service.duration} min
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Coins size={15} />
                        {service.price.toFixed(2)} BOB
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="light"
                      color={service.active ? "default" : "success"}
                      className="text-xs h-7 px-2"
                      onPress={() => void toggleActive(service)}
                    >
                      {service.active ? "Pausar" : "Activar"}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))
          ) : (
            <Card className="border border-dashed border-[var(--app-line)] shadow-none md:col-span-2">
              <CardBody className="items-center gap-3 py-14 text-center">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
                  <Wrench size={22} />
                </span>
                <p className="font-medium">Todavía no tienes servicios</p>
                <p className="text-sm text-[var(--app-muted)]">
                  Agrega el primero desde el formulario.
                </p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      <Modal
        isOpen={Boolean(serviceToDelete)}
        onOpenChange={(open) => {
          if (!open) setServiceToDelete(null);
        }}
      >
        <ModalContent>
          <ModalHeader className="gap-2 text-danger">
            <Trash2 size={20} />
            ¿Eliminar servicio?
          </ModalHeader>
          <ModalBody>
            <p className="text-sm text-[var(--app-muted)]">
              ¿Estás seguro de que deseas eliminar{" "}
              <strong className="text-[var(--app-ink)] font-semibold">
                {serviceToDelete?.name}
              </strong>
              ? Los clientes ya no podrán reservarlo en tu página. Esta acción no se puede deshacer.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              isDisabled={deleting}
              onPress={() => setServiceToDelete(null)}
            >
              Cancelar
            </Button>
            <Button
              color="danger"
              isLoading={deleting}
              onPress={() => void confirmRemove()}
            >
              Eliminar definitivamente
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </section>
  );
}

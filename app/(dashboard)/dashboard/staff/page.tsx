"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Briefcase,
  Check,
  Edit3,
  Mail,
  Plus,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import type { Service } from "@/types/service";
import type { StaffMember } from "@/types/staff";

const staffSchema = z.object({
  name: z.string().trim().min(2, "Escribe un nombre."),
  role: z.string().trim().min(2, "Escribe un rol o especialidad."),
  email: z.string().email("Revisa el correo.").or(z.literal("")),
  avatar: z.string().url("La URL no es válida.").or(z.literal("")),
  googleCalendarId: z.string().min(1, "Ingresa un ID de calendario o 'primary'"),
});

type StaffForm = z.infer<typeof staffSchema>;

const defaultValues: StaffForm = {
  name: "",
  role: "",
  email: "",
  avatar: "",
  googleCalendarId: "primary",
};

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<StaffForm>({ resolver: zodResolver(staffSchema), defaultValues });

  const load = async () => {
    const [staffRes, servicesRes] = await Promise.all([
      fetch("/api/business/staff").then((r) => r.json()).catch(() => ({ success: false, data: [] })),
      fetch("/api/business/services").then((r) => r.json()).catch(() => ({ success: false, data: [] })),
    ]);
    if (staffRes.success) setStaff(staffRes.data);
    if (servicesRes.success) setServices(servicesRes.data);
  };

  useEffect(() => {
    void load();
  }, []);

  const handleEdit = (member: StaffMember) => {
    setEditingStaff(member);
    setValue("name", member.name);
    setValue("role", member.role);
    setValue("email", member.email || "");
    setValue("avatar", member.avatar || "");
    setValue("googleCalendarId", member.googleCalendarId || "primary");
    setSelectedServices(Array.isArray(member.services) ? member.services : []);
    setMessage(null);
  };

  const handleCancel = () => {
    setEditingStaff(null);
    reset(defaultValues);
    setSelectedServices([]);
    setMessage(null);
  };

  const saveStaff = async (values: StaffForm) => {
    setMessage(null);
    try {
      if (editingStaff) {
        const response = await fetch(`/api/business/staff/${editingStaff.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...values,
            services: selectedServices,
          }),
        });
        const result = await response.json();
        if (result.success) {
          setMessage({ text: "Integrante actualizado con éxito." });
          handleCancel();
          await load();
        } else {
          setMessage({ text: result.error || "No se pudo actualizar.", error: true });
        }
      } else {
        const response = await fetch("/api/business/staff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...values,
            services: selectedServices,
            active: true,
          }),
        });
        const result = await response.json();
        if (result.success) {
          setMessage({ text: "Integrante agregado con éxito." });
          handleCancel();
          await load();
        } else {
          setMessage({ text: result.error || "No se pudo agregar.", error: true });
        }
      }
    } catch {
      setMessage({ text: "Error de conexión al guardar integrante.", error: true });
    }
  };

  const toggleActive = async (member: StaffMember) => {
    await fetch(`/api/business/staff/${member.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !member.active }),
    });
    await load();
  };

  const confirmDelete = async () => {
    if (!staffToDelete) return;
    setDeleting(true);
    try {
      await fetch(`/api/business/staff/${staffToDelete.id}`, { method: "DELETE" });
      if (editingStaff?.id === staffToDelete.id) {
        handleCancel();
      }
      setStaffToDelete(null);
      await load();
    } finally {
      setDeleting(false);
    }
  };

  const toggleServiceSelection = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId],
    );
  };

  const selectAllServices = () => {
    if (selectedServices.length === services.length) {
      setSelectedServices([]);
    } else {
      setSelectedServices(services.map((s) => s.id));
    }
  };

  return (
    <section className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--app-primary)]">
            Tu equipo
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
            Personal
          </h1>
          <p className="mt-2 text-[var(--app-muted)]">
            Organiza quién atiende cada reserva y asigna servicios a cada profesional.
          </p>
        </div>
        <div className="flex gap-2">
          <Chip color="primary" variant="flat">
            {staff.filter((m) => m.active !== false).length} activos
          </Chip>
          {staff.some((m) => m.active === false) && (
            <Chip color="default" variant="flat">
              {staff.filter((m) => m.active === false).length} pausados
            </Chip>
          )}
        </div>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
        <Card className="border border-[var(--app-line)] shadow-none">
          <CardHeader className="gap-3 px-5 pb-0 pt-5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
              {editingStaff ? <Edit3 size={18} /> : <Plus size={18} />}
            </span>
            <div className="min-w-0">
              <p className="font-semibold">
                {editingStaff ? "Editar integrante" : "Nuevo integrante"}
              </p>
              <p className="text-xs text-[var(--app-muted)]">
                {editingStaff
                  ? `Modificando a ${editingStaff.name}`
                  : "Aparecerá en tu página de reservas."}
              </p>
            </div>
          </CardHeader>
          <CardBody className="p-5">
            <form className="space-y-4" onSubmit={handleSubmit(saveStaff)}>
              <Input
                label="Nombre"
                placeholder="Ej: Lic. Carlos Mendoza"
                isInvalid={Boolean(errors.name)}
                errorMessage={errors.name?.message}
                {...register("name")}
              />
              <Input
                label="Rol o Especialidad"
                placeholder="Ej: Odontólogo General / Estilista"
                isInvalid={Boolean(errors.role)}
                errorMessage={errors.role?.message}
                {...register("role")}
              />
              <Input
                label="Correo"
                placeholder="correo@ejemplo.com"
                type="email"
                isInvalid={Boolean(errors.email)}
                errorMessage={errors.email?.message}
                {...register("email")}
              />
              <Input
                label="Avatar URL (opcional)"
                placeholder="https://..."
                isInvalid={Boolean(errors.avatar)}
                errorMessage={errors.avatar?.message}
                {...register("avatar")}
              />
              <Input
                label="Google Calendar ID"
                placeholder="primary o tu-correo@gmail.com"
                description="Usa 'primary' para el calendario principal del negocio."
                isInvalid={Boolean(errors.googleCalendarId)}
                errorMessage={errors.googleCalendarId?.message}
                {...register("googleCalendarId")}
              />

              {services.length > 0 && (
                <div className="space-y-2 rounded-xl border border-[var(--app-line)] bg-[var(--app-canvas)] p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-[var(--app-muted)]">
                      Servicios que atiende:
                    </p>
                    <button
                      type="button"
                      onClick={selectAllServices}
                      className="text-xs text-[var(--app-primary)] hover:underline"
                    >
                      {selectedServices.length === services.length
                        ? "Deseleccionar todos"
                        : "Seleccionar todos"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {services.map((svc) => {
                      const isSelected = selectedServices.includes(svc.id);
                      return (
                        <Chip
                          key={svc.id}
                          size="sm"
                          variant={isSelected ? "solid" : "bordered"}
                          color={isSelected ? "primary" : "default"}
                          className="cursor-pointer select-none transition-transform active:scale-95"
                          startContent={isSelected ? <Check size={12} /> : undefined}
                          onClick={() => toggleServiceSelection(svc.id)}
                        >
                          {svc.name}
                        </Chip>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <Button
                  color="primary"
                  className="flex-1"
                  isLoading={isSubmitting}
                  startContent={editingStaff ? <Check size={17} /> : <Plus size={17} />}
                  type="submit"
                >
                  {editingStaff ? "Guardar cambios" : "Agregar integrante"}
                </Button>
                {editingStaff && (
                  <Button
                    variant="bordered"
                    startContent={<X size={16} />}
                    onPress={handleCancel}
                  >
                    Cancelar
                  </Button>
                )}
              </div>

              {message && (
                <p
                  className={`rounded-lg px-3 py-2 text-sm ${
                    message.error
                      ? "bg-danger-50 text-danger"
                      : "bg-success-50 text-success"
                  }`}
                >
                  {message.text}
                </p>
              )}
            </form>
          </CardBody>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {staff.length ? (
            staff.map((member) => {
              const memberServices = services.filter((s) =>
                member.services?.includes(s.id),
              );
              const isEditing = editingStaff?.id === member.id;

              return (
                <Card
                  className={`border shadow-none transition-colors ${
                    isEditing
                      ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)]/20"
                      : "border-[var(--app-line)]"
                  }`}
                  key={member.id}
                >
                  <CardBody className="gap-4 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar
                          name={member.name.slice(0, 1)}
                          src={member.avatar}
                          className="size-11 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h2 className="truncate font-semibold">{member.name}</h2>
                            {member.active === false && (
                              <Chip size="sm" variant="flat" color="warning">
                                Pausado
                              </Chip>
                            )}
                          </div>
                          <p className="text-sm text-[var(--app-muted)] truncate">
                            {member.role || "Integrante del equipo"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          isIconOnly
                          aria-label={`Editar a ${member.name}`}
                          color="primary"
                          size="sm"
                          variant={isEditing ? "solid" : "light"}
                          onPress={() => handleEdit(member)}
                        >
                          <Edit3 size={15} />
                        </Button>
                        <Button
                          isIconOnly
                          aria-label={`Eliminar a ${member.name}`}
                          color="danger"
                          size="sm"
                          variant="light"
                          onPress={() => setStaffToDelete(member)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-[var(--app-muted)]">
                      <Mail size={15} />
                      <span className="truncate">{member.email || "Sin correo especificado"}</span>
                    </div>

                    <div className="space-y-1.5 border-t border-[var(--app-line)] pt-3">
                      <p className="text-xs font-semibold text-[var(--app-muted)] flex items-center gap-1">
                        <Briefcase size={12} />
                        Servicios ({memberServices.length}):
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {memberServices.length > 0 ? (
                          memberServices.map((svc) => (
                            <Chip key={svc.id} size="sm" variant="flat" color="default">
                              {svc.name}
                            </Chip>
                          ))
                        ) : (
                          <span className="text-xs text-[var(--app-muted)] italic">
                            Atiende todos los servicios o ninguno asignado
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-[var(--app-line)] pt-3">
                      <Chip
                        size="sm"
                        startContent={<UserRound size={13} />}
                        color={member.active !== false ? "success" : "default"}
                        variant="flat"
                      >
                        {member.active !== false ? "Disponible para reservas" : "No disponible"}
                      </Chip>
                      <Button
                        size="sm"
                        variant="light"
                        color={member.active !== false ? "default" : "success"}
                        className="text-xs h-7 px-2"
                        onPress={() => void toggleActive(member)}
                      >
                        {member.active !== false ? "Pausar" : "Activar"}
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              );
            })
          ) : (
            <Card className="border border-dashed border-[var(--app-line)] shadow-none md:col-span-2">
              <CardBody className="items-center gap-3 py-14 text-center">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-[#eef1f8] text-[#53658f]">
                  <Users size={22} />
                </span>
                <p className="font-medium">Tu equipo aparecerá aquí</p>
                <p className="text-sm text-[var(--app-muted)]">
                  Agrega profesionales para repartir las reservas según sus servicios.
                </p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      <Modal
        isOpen={Boolean(staffToDelete)}
        onOpenChange={(open) => {
          if (!open) setStaffToDelete(null);
        }}
      >
        <ModalContent>
          <ModalHeader className="gap-2 text-danger">
            <Trash2 size={20} />
            ¿Eliminar integrante del equipo?
          </ModalHeader>
          <ModalBody>
            <p className="text-sm text-[var(--app-muted)]">
              ¿Estás seguro de que deseas eliminar a{" "}
              <strong className="text-[var(--app-ink)] font-semibold">
                {staffToDelete?.name}
              </strong>
              ? Esta acción no se puede deshacer y el integrante ya no podrá recibir reservas.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              isDisabled={deleting}
              onPress={() => setStaffToDelete(null)}
            >
              Cancelar
            </Button>
            <Button
              color="danger"
              isLoading={deleting}
              onPress={() => void confirmDelete()}
            >
              Eliminar definitivamente
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </section>
  );
}

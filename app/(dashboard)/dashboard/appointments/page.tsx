"use client";

import { parseDate } from "@internationalized/date";
import {
  CalendarClock,
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  Plus,
  RefreshCw,
  User,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  Button,
  Calendar,
  Card,
  CardBody,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Spinner,
} from "@/components/ui";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  businessDateAndTime,
  dateWithBusinessTime,
  formatBusinessDate,
  formatBusinessTime,
  getBusinessWeek,
} from "@/lib/utils/date";
import type { Appointment } from "@/types/appointment";
import type { Service } from "@/types/service";
import type { StaffMember } from "@/types/staff";

const statusLabels: Record<string, string> = {
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Completada",
  no_show: "No asistió",
};

const statusColors: Record<
  string,
  "success" | "danger" | "primary" | "default"
> = {
  confirmed: "success",
  cancelled: "danger",
  completed: "primary",
  no_show: "default",
};

const currentDate = () => businessDateAndTime(new Date()).date;

export default function AppointmentsPage() {
  const { business } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMoreAppointments, setHasMoreAppointments] = useState(false);

  // Filtros
  const [statusFilter, setStatusFilter] = useState<
    "all" | "confirmed" | "completed" | "cancelled"
  >("all");

  // Modales
  const [appointmentToCancel, setAppointmentToCancel] =
    useState<Appointment | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const [appointmentToReschedule, setAppointmentToReschedule] =
    useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleSlots, setRescheduleSlots] = useState<string[]>([]);
  const [rescheduleSelectedSlot, setRescheduleSelectedSlot] = useState("");
  const [loadingRescheduleSlots, setLoadingRescheduleSlots] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newServiceId, setNewServiceId] = useState("");
  const [newStaffId, setNewStaffId] = useState("");
  const [newDate, setNewDate] = useState(currentDate);
  const [newSlots, setNewSlots] = useState<string[]>([]);
  const [newSelectedSlot, setNewSelectedSlot] = useState("");
  const [loadingNewSlots, setLoadingNewSlots] = useState(false);
  const [creatingAppointment, setCreatingAppointment] = useState(false);
  const [newAppointmentError, setNewAppointmentError] = useState<string | null>(
    null,
  );

  const load = async () => {
    setLoading(true);
    try {
      const [appointmentsRes, servicesRes, staffRes] = await Promise.all([
        fetch("/api/appointments?limit=100").then((r) => r.json()).catch(() => ({ success: false, data: [] })),
        fetch("/api/business/services").then((r) => r.json()).catch(() => ({ success: false, data: [] })),
        fetch("/api/business/staff").then((r) => r.json()).catch(() => ({ success: false, data: [] })),
      ]);
      if (appointmentsRes.success) {
        setAppointments(appointmentsRes.data.items);
        setNextCursor(appointmentsRes.data.nextCursor);
        setHasMoreAppointments(appointmentsRes.data.hasMore);
      }
      if (servicesRes.success) setServices(servicesRes.data);
      if (staffRes.success) setStaff(staffRes.data);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreAppointments = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    setLoadMoreError(null);
    try {
      const response = await fetch(
        `/api/appointments?limit=100&cursor=${encodeURIComponent(nextCursor)}`,
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "No se pudieron cargar más citas.");
      }
      setAppointments((current) => [...current, ...result.data.items]);
      setNextCursor(result.data.nextCursor);
      setHasMoreAppointments(result.data.hasMore);
    } catch {
      setLoadMoreError("No se pudieron cargar más citas. Intenta nuevamente.");
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const week = useMemo(
    () => getBusinessWeek(new Date(`${selectedDate}T12:00:00`)),
    [selectedDate],
  );

  const weekAppointments = appointments.filter((appointment) =>
    week.some(
      (day) => day.dateKey === businessDateAndTime(appointment.start).date,
    ),
  );

  const selectedAppointments = appointments
    .filter(
      (appointment) =>
        businessDateAndTime(appointment.start).date === selectedDate,
    )
    .sort((a, b) => a.start.localeCompare(b.start));

  const filteredAppointments = selectedAppointments.filter((apt) =>
    statusFilter === "all" ? true : apt.status === statusFilter,
  );
  const newAppointmentService = services.find(
    (service) => service.id === newServiceId,
  );
  const eligibleManualStaff = staff.filter(
    (member) =>
      member.active &&
      (!newAppointmentService?.staffIds?.length ||
        newAppointmentService.staffIds.includes(member.id)),
  );

  const update = async (id: string, status: string) => {
    await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
  };

  const confirmCancel = async () => {
    if (!appointmentToCancel) return;
    setCancelling(true);
    try {
      await update(appointmentToCancel.id, "cancelled");
      setAppointmentToCancel(null);
    } finally {
      setCancelling(false);
    }
  };

  // Carga de disponibilidad para Reprogramar
  useEffect(() => {
    if (!appointmentToReschedule || !business?.id || !rescheduleDate) {
      setRescheduleSlots([]);
      return;
    }
    let isMounted = true;
    setLoadingRescheduleSlots(true);
    setRescheduleError(null);
    const params = new URLSearchParams({
      businessId: business.id,
      serviceId: appointmentToReschedule.serviceId,
      date: rescheduleDate,
    });
    if (appointmentToReschedule.staffId) {
      params.append("staffId", appointmentToReschedule.staffId);
    }
    fetch(`/api/availability?${params.toString()}`)
      .then((r) => r.json())
      .then((res) => {
        if (!isMounted) return;
        if (res.success && Array.isArray(res.data?.slots)) {
          setRescheduleSlots(res.data.slots);
        } else {
          setRescheduleSlots([]);
        }
      })
      .catch(() => {
        if (isMounted) setRescheduleSlots([]);
      })
      .finally(() => {
        if (isMounted) setLoadingRescheduleSlots(false);
      });

    return () => {
      isMounted = false;
    };
  }, [appointmentToReschedule, business?.id, rescheduleDate]);

  const openRescheduleModal = (appointment: Appointment) => {
    setAppointmentToReschedule(appointment);
    setRescheduleDate(businessDateAndTime(appointment.start).date);
    setRescheduleSelectedSlot("");
    setRescheduleError(null);
  };

  const submitReschedule = async () => {
    if (
      !appointmentToReschedule ||
      !rescheduleDate ||
      !rescheduleSelectedSlot
    ) {
      setRescheduleError("Por favor selecciona un horario disponible.");
      return;
    }
    setRescheduling(true);
    setRescheduleError(null);
    try {
      const start = dateWithBusinessTime(rescheduleDate, rescheduleSelectedSlot);
      const service = services.find(
        (s) => s.id === appointmentToReschedule.serviceId,
      );
      const duration = service ? service.duration : 30;
      const end = new Date(start.getTime() + duration * 60_000);

      const res = await fetch(`/api/appointments/${appointmentToReschedule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: start.toISOString(),
          end: end.toISOString(),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setRescheduleError(data.error || "No se pudo mover la cita.");
        return;
      }
      setAppointmentToReschedule(null);
      await load();
    } catch {
      setRescheduleError("Error de comunicación con el servidor.");
    } finally {
      setRescheduling(false);
    }
  };

  // Carga de disponibilidad para Nueva Cita
  useEffect(() => {
    if (!isNewAppointmentOpen || !business?.id || !newServiceId || !newDate) {
      setNewSlots([]);
      return;
    }
    let isMounted = true;
    setLoadingNewSlots(true);
    setNewAppointmentError(null);
    const params = new URLSearchParams({
      businessId: business.id,
      serviceId: newServiceId,
      date: newDate,
    });
    if (newStaffId) {
      params.append("staffId", newStaffId);
    }
    fetch(`/api/availability?${params.toString()}`)
      .then((r) => r.json())
      .then((res) => {
        if (!isMounted) return;
        if (res.success && Array.isArray(res.data?.slots)) {
          setNewSlots(res.data.slots);
        } else {
          setNewSlots([]);
        }
      })
      .catch(() => {
        if (isMounted) setNewSlots([]);
      })
      .finally(() => {
        if (isMounted) setLoadingNewSlots(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isNewAppointmentOpen, business?.id, newServiceId, newStaffId, newDate]);

  const openNewAppointmentModal = () => {
    setIsNewAppointmentOpen(true);
    setNewClientName("");
    setNewClientPhone("");
    setNewClientEmail("");
    const defaultService = services.find((s) => s.active);
    setNewServiceId(defaultService?.id || "");
    setNewStaffId("");
    setNewDate(selectedDate);
    setNewSelectedSlot("");
    setNewAppointmentError(null);
  };

  const submitNewAppointment = async () => {
    if (!business?.id) return;
    if (!newClientName.trim()) {
      setNewAppointmentError("Ingresa el nombre del cliente.");
      return;
    }
    if (!newClientPhone.trim()) {
      setNewAppointmentError("Ingresa el teléfono o WhatsApp del cliente.");
      return;
    }
    if (!newServiceId) {
      setNewAppointmentError("Selecciona un servicio.");
      return;
    }
    if (!newSelectedSlot) {
      setNewAppointmentError("Selecciona una hora disponible para la cita.");
      return;
    }

    setCreatingAppointment(true);
    setNewAppointmentError(null);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: business.id,
          serviceId: newServiceId,
          staffId: newStaffId || undefined,
          date: newDate,
          time: newSelectedSlot,
          clientName: newClientName.trim(),
          clientPhone: newClientPhone.trim(),
          clientEmail: newClientEmail.trim(),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setNewAppointmentError(data.error || "No se pudo registrar la cita.");
        return;
      }
      setIsNewAppointmentOpen(false);
      await load();
    } catch {
      setNewAppointmentError("Error de conexión al registrar la cita.");
    } finally {
      setCreatingAppointment(false);
    }
  };

  const getServiceName = (serviceId: string) => {
    return services.find((s) => s.id === serviceId)?.name || "Servicio";
  };

  const getStaffName = (staffId: string) => {
    return staff.find((s) => s.id === staffId)?.name || "Equipo";
  };

  return (
    <section className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--app-primary)]">
            Agenda
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
            Citas
          </h1>
          <p className="mt-2 text-[var(--app-muted)]">
            Mira la semana completa, agenda citas manualmente y administra cada reserva.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            startContent={<Plus size={16} />}
            color="primary"
            onPress={openNewAppointmentModal}
          >
            Nueva cita
          </Button>
          <Button
            startContent={<RefreshCw size={16} />}
            variant="bordered"
            onPress={() => void load()}
          >
            Actualizar
          </Button>
        </div>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
        <Card className="border border-[var(--app-line)] shadow-none">
          <CardBody className="items-center gap-4 p-5">
            <Calendar
              aria-label="Selecciona un día"
              value={parseDate(selectedDate)}
              onChange={(value) => setSelectedDate(value.toString())}
            />
            <div className="w-full rounded-xl bg-[var(--app-canvas)] p-3 text-sm">
              <p className="font-semibold">
                {formatBusinessDate(`${selectedDate}T12:00:00-04:00`)}
              </p>
              <p className="mt-1 text-[var(--app-muted)]">
                {selectedAppointments.length} cita
                {selectedAppointments.length === 1 ? "" : "s"} este día
              </p>
            </div>
          </CardBody>
        </Card>

        <Card className="overflow-hidden border border-[var(--app-line)] shadow-none">
          <CardBody className="gap-4 p-0">
            <div className="flex flex-col justify-between gap-2 border-b border-[var(--app-line)] px-5 py-4 sm:flex-row sm:items-center">
              <div>
                <p className="font-semibold">
                  Semana del{" "}
                  {formatBusinessDate(`${week[0].dateKey}T12:00:00-04:00`)}
                </p>
                <p className="text-sm text-[var(--app-muted)]">
                  Selecciona cualquier día para ver sus horarios.
                </p>
              </div>
              <Chip color="primary" size="sm" variant="flat">
                {weekAppointments.length} en la semana
              </Chip>
            </div>
            <div className="hidden min-w-[840px] grid-cols-7 divide-x divide-[var(--app-line)] xl:grid">
              {week.map((day) => {
                const dayAppointments = appointments
                  .filter(
                    (appointment) =>
                      businessDateAndTime(appointment.start).date ===
                      day.dateKey,
                  )
                  .sort((a, b) => a.start.localeCompare(b.start));
                const selected = day.dateKey === selectedDate;
                return (
                  <Button
                    key={day.dateKey}
                    className={`h-auto min-h-52 w-full min-w-0 flex-col items-start justify-start rounded-none p-3 text-left transition-colors ${selected ? "bg-[var(--app-primary-soft)]" : "hover:bg-[var(--app-canvas)]"}`}
                    variant="light"
                    onPress={() => setSelectedDate(day.dateKey)}
                  >
                    <p className="text-xs font-semibold uppercase text-[var(--app-muted)]">
                      {day.date.toLocaleDateString("es-BO", {
                        weekday: "short",
                      })}
                    </p>
                    <p className="mt-1 text-xl font-semibold">
                      {day.date.getDate()}
                    </p>
                    <div className="mt-4 space-y-2">
                      {dayAppointments.length ? (
                        dayAppointments.map((appointment) => (
                          <div
                            key={appointment.id}
                            className={`rounded-lg border px-2 py-2 text-xs ${appointment.status === "cancelled" ? "border-danger/20 bg-danger/5 opacity-60" : "border-[var(--app-primary)]/20 bg-white"}`}
                          >
                            <p className="font-semibold">
                              {formatBusinessTime(appointment.start)}
                            </p>
                            <p className="mt-1 truncate">
                              {appointment.clientName}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-[var(--app-muted)]">Libre</p>
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-4 xl:hidden">
              {week.map((day) => {
                const dayAppointments = appointments.filter(
                  (appointment) =>
                    businessDateAndTime(appointment.start).date === day.dateKey,
                );
                const selected = day.dateKey === selectedDate;
                return (
                  <Button
                    key={day.dateKey}
                    className={`h-auto min-w-0 flex-col items-start gap-1 p-3 text-left ${selected ? "bg-[var(--app-primary-soft)]" : "bg-[var(--app-canvas)]"}`}
                    variant="light"
                    onPress={() => setSelectedDate(day.dateKey)}
                  >
                    <span className="text-xs font-semibold uppercase text-[var(--app-muted)]">
                      {day.date.toLocaleDateString("es-BO", {
                        weekday: "short",
                      })}
                    </span>
                    <span className="text-lg font-semibold">
                      {day.date.getDate()}
                    </span>
                    <span className="text-xs text-[var(--app-muted)]">
                      {dayAppointments.length
                        ? `${dayAppointments.length} cita${dayAppointments.length === 1 ? "" : "s"}`
                        : "Libre"}
                    </span>
                  </Button>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </div>

      <Card className="border border-[var(--app-line)] shadow-none">
        <CardBody className="gap-0 p-0">
          <div className="flex flex-col gap-3 border-b border-[var(--app-line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">Detalle del día</p>
              <p className="mt-1 text-sm text-[var(--app-muted)]">
                {formatBusinessDate(`${selectedDate}T12:00:00-04:00`)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Chip
                size="sm"
                variant={statusFilter === "all" ? "solid" : "flat"}
                color={statusFilter === "all" ? "primary" : "default"}
                className="cursor-pointer"
                onClick={() => setStatusFilter("all")}
              >
                Todas ({selectedAppointments.length})
              </Chip>
              <Chip
                size="sm"
                variant={statusFilter === "confirmed" ? "solid" : "flat"}
                color={statusFilter === "confirmed" ? "success" : "default"}
                className="cursor-pointer"
                onClick={() => setStatusFilter("confirmed")}
              >
                Confirmadas ({selectedAppointments.filter((a) => a.status === "confirmed").length})
              </Chip>
              <Chip
                size="sm"
                variant={statusFilter === "completed" ? "solid" : "flat"}
                color={statusFilter === "completed" ? "primary" : "default"}
                className="cursor-pointer"
                onClick={() => setStatusFilter("completed")}
              >
                Completadas ({selectedAppointments.filter((a) => a.status === "completed").length})
              </Chip>
              <Chip
                size="sm"
                variant={statusFilter === "cancelled" ? "solid" : "flat"}
                color={statusFilter === "cancelled" ? "danger" : "default"}
                className="cursor-pointer"
                onClick={() => setStatusFilter("cancelled")}
              >
                Canceladas ({selectedAppointments.filter((a) => a.status === "cancelled").length})
              </Chip>
            </div>
          </div>
          {loading ? (
            <p className="p-6 text-sm text-[var(--app-muted)]">
              Cargando agenda...
            </p>
          ) : filteredAppointments.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-[var(--app-canvas)] text-xs uppercase text-[var(--app-muted)]">
                  <tr>
                    <th className="px-5 py-3">Hora</th>
                    <th className="px-5 py-3">Cliente</th>
                    <th className="px-5 py-3">Servicio / Profesional</th>
                    <th className="px-5 py-3">Estado</th>
                    <th className="px-5 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((appointment) => (
                    <tr
                      key={appointment.id}
                      className="border-t border-[var(--app-line)]"
                    >
                      <td className="px-5 py-4 font-semibold whitespace-nowrap">
                        {formatBusinessTime(appointment.start)} -{" "}
                        {formatBusinessTime(appointment.end)}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium">{appointment.clientName}</p>
                        <p className="text-xs text-[var(--app-muted)]">
                          {appointment.clientPhone}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium">
                          {getServiceName(appointment.serviceId)}
                        </p>
                        <p className="text-xs text-[var(--app-muted)]">
                          {getStaffName(appointment.staffId)}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <Chip
                          color={statusColors[appointment.status] || "default"}
                          size="sm"
                          variant="flat"
                        >
                          {statusLabels[appointment.status] ||
                            appointment.status}
                        </Chip>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {appointment.status === "confirmed" ? (
                            <>
                              <Button
                                size="sm"
                                startContent={<CalendarDays size={14} />}
                                variant="bordered"
                                onPress={() => openRescheduleModal(appointment)}
                              >
                                Reprogramar
                              </Button>
                              <Button
                                size="sm"
                                startContent={<Check size={14} />}
                                variant="flat"
                                color="success"
                                onPress={() =>
                                  void update(appointment.id, "completed")
                                }
                              >
                                Completar
                              </Button>
                              <Button
                                color="danger"
                                size="sm"
                                startContent={<X size={14} />}
                                variant="light"
                                onPress={() => setAppointmentToCancel(appointment)}
                              >
                                Cancelar
                              </Button>
                            </>
                          ) : (
                            <span className="text-xs text-[var(--app-muted)] italic">
                              Sin acciones pendientes
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
                <CalendarClock size={22} />
              </span>
              <p className="font-medium">
                {selectedAppointments.length === 0
                  ? "No hay citas este día"
                  : "No hay citas con este filtro"}
              </p>
              <p className="text-sm text-[var(--app-muted)]">
                {selectedAppointments.length === 0
                  ? "Selecciona otro día o crea una nueva cita manual con el botón superior."
                  : "Prueba seleccionando 'Todas' para ver todas las citas del día."}
              </p>
            </div>
          )}
          {hasMoreAppointments ? (
            <div className="border-t border-[var(--app-line)] p-4 text-center">
              {loadMoreError ? (
                <p className="mb-3 text-sm text-danger">{loadMoreError}</p>
              ) : null}
              <Button
                isLoading={loadingMore}
                startContent={!loadingMore ? <ChevronDown size={16} /> : undefined}
                variant="flat"
                onPress={() => void loadMoreAppointments()}
              >
                Cargar citas anteriores
              </Button>
            </div>
          ) : null}
        </CardBody>
      </Card>

      {/* Modal: Cancelar Cita */}
      <Modal
        isOpen={Boolean(appointmentToCancel)}
        onOpenChange={(open) => {
          if (!open) setAppointmentToCancel(null);
        }}
      >
        <ModalContent>
          <ModalHeader className="gap-2 text-danger">
            <X size={20} />
            ¿Cancelar cita?
          </ModalHeader>
          <ModalBody>
            <p className="text-sm text-[var(--app-muted)]">
              ¿Estás seguro de que deseas cancelar la cita de{" "}
              <strong className="text-[var(--app-ink)] font-semibold">
                {appointmentToCancel?.clientName}
              </strong>
              {appointmentToCancel?.clientPhone && (
                <span> ({appointmentToCancel.clientPhone})</span>
              )}
              {appointmentToCancel?.start && (
                <span>
                  {" "}programada para las{" "}
                  <strong>{formatBusinessTime(appointmentToCancel.start)}</strong>
                </span>
              )}
              ? El horario quedará libre para que otros clientes puedan reservar.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              isDisabled={cancelling}
              onPress={() => setAppointmentToCancel(null)}
            >
              No cancelar
            </Button>
            <Button
              color="danger"
              isLoading={cancelling}
              onPress={() => void confirmCancel()}
            >
              Sí, cancelar cita
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal: Reprogramar Cita Inteligente */}
      <Modal
        isOpen={Boolean(appointmentToReschedule)}
        size="lg"
        onOpenChange={(open) => {
          if (!open) setAppointmentToReschedule(null);
        }}
      >
        <ModalContent>
          <ModalHeader className="gap-2">
            <Clock size={20} className="text-[var(--app-primary)]" />
            Reprogramar Cita
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div className="rounded-xl border border-[var(--app-line)] bg-[var(--app-canvas)] p-3 text-sm">
              <p className="font-semibold text-[var(--app-ink)]">
                {appointmentToReschedule?.clientName}
              </p>
              <p className="text-xs text-[var(--app-muted)] mt-0.5">
                {appointmentToReschedule &&
                  getServiceName(appointmentToReschedule.serviceId)}{" "}
                · Horario actual:{" "}
                {appointmentToReschedule &&
                  formatBusinessDate(appointmentToReschedule.start)}{" "}
                {appointmentToReschedule &&
                  formatBusinessTime(appointmentToReschedule.start)}
              </p>
            </div>

            <div>
              <label
                htmlFor="reschedule-date"
                className="text-xs font-semibold text-[var(--app-muted)] block mb-1.5"
              >
                Selecciona la nueva fecha
              </label>
              <Input
                id="reschedule-date"
                type="date"
                value={rescheduleDate}
                min={currentDate()}
                onChange={(e) => {
                  setRescheduleDate(e.target.value);
                  setRescheduleSelectedSlot("");
                }}
              />
            </div>

            <div>
              <p className="text-xs font-semibold text-[var(--app-muted)] mb-2">
                Horarios disponibles para este día:
              </p>
              {loadingRescheduleSlots ? (
                <div className="flex items-center justify-center p-6">
                  <Spinner size="sm" label="Consultando disponibilidad..." />
                </div>
              ) : rescheduleSlots.length > 0 ? (
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                  {rescheduleSlots.map((slot) => {
                    const isSelected = rescheduleSelectedSlot === slot;
                    return (
                      <Button
                        key={slot}
                        size="sm"
                        variant={isSelected ? "solid" : "bordered"}
                        color={isSelected ? "primary" : "default"}
                        className="font-medium"
                        onPress={() => setRescheduleSelectedSlot(slot)}
                      >
                        {slot}
                      </Button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-[var(--app-muted)] italic p-3 text-center rounded-lg bg-[var(--app-canvas)]">
                  No hay horarios disponibles en esta fecha. Elige otro día.
                </p>
              )}
            </div>

            {rescheduleError && (
              <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger">
                {rescheduleError}
              </p>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              isDisabled={rescheduling}
              onPress={() => setAppointmentToReschedule(null)}
            >
              Cancelar
            </Button>
            <Button
              color="primary"
              isLoading={rescheduling}
              isDisabled={!rescheduleSelectedSlot}
              onPress={() => void submitReschedule()}
            >
              Confirmar cambio
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal: Nueva Cita Manual */}
      <Modal
        isOpen={isNewAppointmentOpen}
        size="xl"
        onOpenChange={(open) => {
          if (!open) setIsNewAppointmentOpen(false);
        }}
      >
        <ModalContent>
          <ModalHeader className="gap-2">
            <Plus size={20} className="text-[var(--app-primary)]" />
            Registrar Nueva Cita Manual
          </ModalHeader>
          <ModalBody className="space-y-4">
            <p className="text-xs text-[var(--app-muted)] -mt-2">
              Registra citas recibidas por teléfono, WhatsApp o de forma presencial.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Nombre del Cliente"
                placeholder="Ej: Sofía Arteaga"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                isRequired
              />
              <Input
                label="Teléfono / WhatsApp"
                placeholder="Ej: 71234567"
                value={newClientPhone}
                onChange={(e) => setNewClientPhone(e.target.value)}
                isRequired
              />
            </div>

            <Input
              label="Correo electrónico (opcional)"
              placeholder="cliente@ejemplo.com"
              type="email"
              value={newClientEmail}
              onChange={(e) => setNewClientEmail(e.target.value)}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="new-appointment-service"
                  className="text-xs font-semibold text-[var(--app-muted)] block mb-1.5"
                >
                  Servicio
                </label>
                <select
                  id="new-appointment-service"
                  className="w-full rounded-xl border border-[var(--app-line)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--app-primary)]"
                  value={newServiceId}
                  onChange={(e) => {
                    setNewServiceId(e.target.value);
                    setNewStaffId("");
                    setNewSelectedSlot("");
                  }}
                >
                  <option value="">Selecciona un servicio</option>
                  {services
                    .filter((svc) => svc.active)
                    .map((svc) => (
                      <option key={svc.id} value={svc.id}>
                        {svc.name} ({svc.duration} min - {svc.price} BOB)
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="new-appointment-staff"
                  className="text-xs font-semibold text-[var(--app-muted)] block mb-1.5"
                >
                  Profesional (opcional)
                </label>
                <select
                  id="new-appointment-staff"
                  className="w-full rounded-xl border border-[var(--app-line)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--app-primary)]"
                  value={newStaffId}
                  onChange={(e) => {
                    setNewStaffId(e.target.value);
                    setNewSelectedSlot("");
                  }}
                >
                  <option value="">Cualquier profesional disponible</option>
                  {eligibleManualStaff.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="new-appointment-date"
                className="text-xs font-semibold text-[var(--app-muted)] block mb-1.5"
              >
                Fecha de la Cita
              </label>
              <Input
                id="new-appointment-date"
                type="date"
                value={newDate}
                min={currentDate()}
                onChange={(e) => {
                  setNewDate(e.target.value);
                  setNewSelectedSlot("");
                }}
              />
            </div>

            <div>
              <p className="text-xs font-semibold text-[var(--app-muted)] mb-2">
                Horario disponible:
              </p>
              {loadingNewSlots ? (
                <div className="flex items-center justify-center p-6">
                  <Spinner size="sm" label="Buscando horarios libres..." />
                </div>
              ) : newSlots.length > 0 ? (
                <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1 sm:grid-cols-6">
                  {newSlots.map((slot) => {
                    const isSelected = newSelectedSlot === slot;
                    return (
                      <Button
                        key={slot}
                        size="sm"
                        variant={isSelected ? "solid" : "bordered"}
                        color={isSelected ? "primary" : "default"}
                        className="font-medium"
                        onPress={() => setNewSelectedSlot(slot)}
                      >
                        {slot}
                      </Button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-[var(--app-muted)] italic p-3 text-center rounded-lg bg-[var(--app-canvas)]">
                  No hay horarios disponibles para esta fecha o servicio.
                </p>
              )}
            </div>

            {newAppointmentError && (
              <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger">
                {newAppointmentError}
              </p>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              isDisabled={creatingAppointment}
              onPress={() => setIsNewAppointmentOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              color="primary"
              isLoading={creatingAppointment}
              isDisabled={!newSelectedSlot || !newClientName.trim()}
              onPress={() => void submitNewAppointment()}
            >
              Registrar cita
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </section>
  );
}

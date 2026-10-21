"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { parseDate, today } from "@internationalized/date";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MessageCircle,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Button,
  Calendar,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Input,
  Select,
  SelectItem,
  Spinner,
} from "@/components/ui";
import { BUSINESS_TIME_ZONE } from "@/lib/utils/date";
import type { BusinessHours } from "@/types/business";
import type { BookingCalendarBlockProps } from "@/types/blocks";
import type { Service } from "@/types/service";
import type { StaffMember } from "@/types/staff";

const bookingFormSchema = z.object({
  clientName: z.string().trim().min(2, "Escribe tu nombre."),
  clientPhone: z.string().trim().min(6, "Escribe un WhatsApp válido."),
  clientEmail: z.string().email("Revisa tu correo.").or(z.literal("")),
});

const previewSlots = ["09:00", "10:30", "12:00", "14:30", "16:00", "17:30"];

type BookingForm = z.infer<typeof bookingFormSchema>;
type MessageTone = "success" | "danger" | null;

interface BookingCalendarComponentProps extends BookingCalendarBlockProps {
  businessId: string;
  businessWhatsapp?: string;
  businessHours?: BusinessHours;
  services: Service[];
  staff: StaffMember[];
  preview?: boolean;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-BO", {
    day: "numeric",
    month: "long",
    weekday: "long",
  }).format(parseDate(date).toDate(BUSINESS_TIME_ZONE));
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-BO", {
    currency: "BOB",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(price);
}

export function BookingCalendarBlock({
  businessId,
  businessWhatsapp,
  businessHours,
  services,
  staff,
  title = "Encuentra tu horario",
  subtitle = "Elige un servicio, revisa los días activos y selecciona una hora libre.",
  preview = false,
}: BookingCalendarComponentProps) {
  const activeServices = useMemo(
    () => services.filter((service) => service.active),
    [services],
  );
  const [serviceId, setServiceId] = useState("");
  const [staffId, setStaffId] = useState("");
  const [date, setDate] = useState(today(BUSINESS_TIME_ZONE).toString());
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<MessageTone>(null);
  const [confirmationUrl, setConfirmationUrl] = useState<string | null>(null);
  const service = activeServices.find((item) => item.id === serviceId);
  const availableStaff = useMemo(() => {
    if (!service) return [];
    if (!staff.length) return [];
    if (service.staffIds && service.staffIds.length > 0) {
      const filtered = staff.filter(
        (member) => member.active && service.staffIds.includes(member.id),
      );
      if (filtered.length > 0) return filtered;
    }
    return staff.filter((member) => member.active);
  }, [service, staff]);

  const selectedStaff = availableStaff.find((member) => member.id === staffId);
  const canBook = Boolean(service);
  const visibleSlots = preview ? previewSlots : slots;
  const isSelectedToday = date === today(BUSINESS_TIME_ZONE).toString();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: { clientName: "", clientPhone: "", clientEmail: "" },
  });

  useEffect(() => {
    if (!activeServices.length) {
      setServiceId("");
      return;
    }
    if (!activeServices.some((item) => item.id === serviceId)) {
      setServiceId(activeServices[0].id);
      setSelectedSlot("");
    }
  }, [activeServices, serviceId]);

  useEffect(() => {
    const firstStaffId = availableStaff[0]?.id ?? "";
    if (!availableStaff.some((member) => member.id === staffId)) {
      setStaffId(firstStaffId);
      setSelectedSlot("");
    }
  }, [availableStaff, staffId]);

  useEffect(() => {
    if (preview) {
      setLoadingSlots(false);
      setAvailabilityError(null);
      return;
    }
    if (!date || !serviceId) {
      setLoadingSlots(false);
      setSlots([]);
      return;
    }

    const controller = new AbortController();
    setLoadingSlots(true);
    setAvailabilityError(null);
    setSlots([]);
    const staffQuery = staffId ? `&staffId=${encodeURIComponent(staffId)}` : "";
    void fetch(
      `/api/availability?businessId=${businessId}&serviceId=${serviceId}${staffQuery}&date=${date}`,
      { signal: controller.signal },
    )
      .then(async (response) => ({
        ok: response.ok,
        result: (await response.json()) as {
          data?: { slots?: string[] };
          error?: string;
          success?: boolean;
        },
      }))
      .then(({ ok, result }) => {
        if (controller.signal.aborted) return;
        if (ok && result.success) {
          setSlots(result.data?.slots ?? []);
          return;
        }
        setAvailabilityError(
          result.error || "No pudimos consultar los horarios disponibles.",
        );
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setAvailabilityError("No pudimos consultar los horarios disponibles.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingSlots(false);
      });

    return () => controller.abort();
  }, [businessId, date, preview, serviceId, staffId]);

  const resetSelection = () => {
    setSelectedSlot("");
    setMessage(null);
    setMessageTone(null);
    setConfirmationUrl(null);
  };

  const bookAppointment = async (values: BookingForm) => {
    if (!date || !selectedSlot || !service || preview) return;
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          serviceId,
          staffId: staffId || undefined,
          date,
          time: selectedSlot,
          ...values,
        }),
      });
      const result = (await response.json()) as {
        error?: string;
        success?: boolean;
      };
      if (!response.ok || !result.success) {
        setMessage(result.error || "No pudimos confirmar la cita.");
        setMessageTone("danger");
        return;
      }
      setSlots((current) => current.filter((slot) => slot !== selectedSlot));
      setMessage("Tu cita quedó confirmada. Te esperamos.");
      setMessageTone("success");
      const whatsappNumber = businessWhatsapp?.replace(/\D/g, "");
      setConfirmationUrl(
        whatsappNumber
          ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
              `Hola, acabo de reservar ${service.name} para el ${formatDate(date)} a las ${selectedSlot}. Soy ${values.clientName}.`,
            )}`
          : null,
      );
      setSelectedSlot("");
      reset();
    } catch {
      setMessage("No pudimos confirmar la cita. Intenta nuevamente.");
      setMessageTone("danger");
    }
  };

  return (
    <section className="border-b border-black/10 px-5 py-16 md:py-20 lg:px-8" id="reservar">
      <div className="mx-auto max-w-[1280px]">
        <Card className="border border-black/10 bg-black/[0.02] shadow-none" radius="lg">
          <CardHeader className="flex flex-col items-start gap-4 px-6 pb-0 pt-6 sm:px-8 sm:pt-8">
            <div className="flex w-full items-start justify-between gap-4">
              <div>
                <Chip
                  className="border border-[var(--landing-primary)]/20 bg-[var(--landing-primary)]/10 text-[var(--landing-primary)]"
                  color="primary"
                  size="sm"
                  startContent={<CalendarDays size={14} />}
                  variant="flat"
                >
                  Reserva en 3 pasos
                </Chip>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em]">
                  {title}
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 opacity-65">{subtitle}</p>
              </div>
              <Clock3 className="hidden opacity-35 sm:block" size={28} />
            </div>
          </CardHeader>
          <CardBody className="gap-7 p-6 sm:p-8">
            {!activeServices.length ? (
              <div className="border border-dashed border-black/15 bg-white/50 p-5 text-sm opacity-70">
                Este negocio todavía no tiene servicios disponibles para reservar.
              </div>
            ) : (
              <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <div className="space-y-5">
                  <div>
                    <p className="text-sm font-semibold">1. Elige el servicio</p>
                    <p className="mt-1 text-sm opacity-65">
                      Verás horarios que respetan la duración de tu reserva.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Select
                      label="Servicio"
                      placeholder="Selecciona un servicio"
                      disallowEmptySelection
                      selectedKeys={serviceId ? new Set([serviceId]) : new Set([])}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0];
                        if (selected) {
                          setServiceId(String(selected));
                          resetSelection();
                        }
                      }}
                    >
                      {activeServices.map((item) => (
                        <SelectItem key={item.id} textValue={item.name}>
                          <div className="flex items-center justify-between gap-2">
                            <span>{item.name}</span>
                            <span className="text-xs opacity-60">
                              {item.duration}m · {formatPrice(item.price)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                  {service ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <Chip size="sm" variant="flat" color="primary">
                        ⏱️ {service.duration} min
                      </Chip>
                      <Chip size="sm" variant="flat" color="success">
                        💰 {formatPrice(service.price)}
                      </Chip>
                    </div>
                  ) : null}
                  {availableStaff.length > 1 ? (
                    <Select
                      label="Profesional"
                      placeholder="Selecciona el profesional"
                      disallowEmptySelection
                      selectedKeys={staffId ? new Set([staffId]) : new Set([])}
                      startContent={<UserRound size={16} />}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0];
                        if (selected) {
                          setStaffId(String(selected));
                          resetSelection();
                        }
                      }}
                    >
                      {availableStaff.map((member) => (
                        <SelectItem key={member.id} textValue={member.name}>
                          {member.name} {member.role ? `(${member.role})` : ""}
                        </SelectItem>
                      ))}
                    </Select>
                  ) : selectedStaff ? (
                    <div className="flex items-center gap-2 text-sm text-[var(--landing-primary)] font-medium">
                      <UserRound size={16} />
                      Atiende: {selectedStaff.name} {selectedStaff.role ? `· ${selectedStaff.role}` : ""}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs opacity-65">
                      <UserRound size={14} />
                      Atención directa del negocio
                    </div>
                  )}
                  <div className="space-y-3 border-t border-black/10 pt-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">2. Escoge una fecha</p>
                        <p className="mt-1 text-sm capitalize opacity-75 font-medium">{formatDate(date)}</p>
                      </div>
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          variant={isSelectedToday ? "solid" : "flat"}
                          color={isSelectedToday ? "primary" : "default"}
                          onPress={() => {
                            setDate(today(BUSINESS_TIME_ZONE).toString());
                            resetSelection();
                          }}
                        >
                          Hoy
                        </Button>
                        <Button
                          size="sm"
                          variant="flat"
                          onPress={() => {
                            const tmrw = today(BUSINESS_TIME_ZONE).add({ days: 1 }).toString();
                            setDate(tmrw);
                            resetSelection();
                          }}
                        >
                          Mañana
                        </Button>
                      </div>
                    </div>
                    <Calendar
                      aria-label="Selecciona una fecha"
                      className="w-full"
                      isDisabled={!canBook}
                      isDateUnavailable={(value) => {
                        const weekdayKeys = [
                          "sunday",
                          "monday",
                          "tuesday",
                          "wednesday",
                          "thursday",
                          "friday",
                          "saturday",
                        ] as const;
                        const weekday = value.toDate(BUSINESS_TIME_ZONE).getDay();
                        return businessHours?.[weekdayKeys[weekday]]?.enabled === false;
                      }}
                      minValue={today(BUSINESS_TIME_ZONE)}
                      value={parseDate(date)}
                      onChange={(value) => {
                        if (value) {
                          setDate(value.toString());
                          resetSelection();
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-5 border-t border-black/10 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">3. Escoge una hora</p>
                      <p className="mt-1 text-sm capitalize opacity-65">{formatDate(date)}</p>
                    </div>
                    {selectedStaff ? (
                      <Chip size="sm" variant="flat">
                        {selectedStaff.name}
                      </Chip>
                    ) : null}
                  </div>

                  {!canBook ? (
                    <p className="border border-dashed border-black/15 bg-white/50 p-4 text-sm opacity-70">
                      Elige un servicio para ver los horarios disponibles.
                    </p>
                  ) : loadingSlots ? (
                    <div className="flex min-h-32 items-center justify-center">
                      <Spinner label="Buscando horarios disponibles" />
                    </div>
                  ) : availabilityError ? (
                    <p className="border border-danger/20 bg-danger-50 p-4 text-sm text-danger">
                      {availabilityError}
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                      {visibleSlots.length ? (
                        visibleSlots.map((slot) => (
                          <Button
                            key={slot}
                            className="min-h-11 font-medium"
                            color={selectedSlot === slot ? "primary" : "default"}
                            variant={selectedSlot === slot ? "solid" : "bordered"}
                            onPress={() => {
                              setSelectedSlot(slot);
                              setMessage(null);
                              setMessageTone(null);
                            }}
                          >
                            {slot}
                          </Button>
                        ))
                      ) : (
                        <div className="col-span-full space-y-3 rounded-xl border border-dashed border-black/15 bg-white/50 p-5 text-sm opacity-85">
                          <p>
                            {isSelectedToday
                              ? "Los horarios para el día de hoy ya no están disponibles o la jornada ha concluido."
                              : "No hay horarios disponibles para esta fecha. Prueba con otro día."}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {[1, 2, 3].map((offset) => {
                              const nextDate = parseDate(date)
                                .add({ days: offset })
                                .toString();
                              return (
                                <Button
                                  key={nextDate}
                                  size="sm"
                                  color={offset === 1 ? "primary" : "default"}
                                  variant={offset === 1 ? "flat" : "bordered"}
                                  onPress={() => {
                                    setDate(nextDate);
                                    resetSelection();
                                  }}
                                >
                                  {offset === 1
                                    ? "Mañana"
                                    : `En ${offset} días`}
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedSlot ? (
                    <form
                      className="space-y-4 border-t border-black/10 pt-6"
                      onSubmit={handleSubmit(bookAppointment)}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-medium">Confirma tus datos</p>
                          <p className="mt-1 text-sm opacity-65">
                            {service?.name} con {selectedStaff?.name} a las {selectedSlot}.
                          </p>
                        </div>
                        <Chip color="primary" variant="flat">
                          {selectedSlot}
                        </Chip>
                      </div>
                      <div className="grid gap-4 md:grid-cols-3">
                        <Input
                          isDisabled={preview}
                          isInvalid={Boolean(errors.clientName)}
                          label="Nombre"
                          errorMessage={errors.clientName?.message}
                          {...register("clientName")}
                        />
                        <Input
                          isDisabled={preview}
                          isInvalid={Boolean(errors.clientPhone)}
                          label="WhatsApp"
                          errorMessage={errors.clientPhone?.message}
                          {...register("clientPhone")}
                        />
                        <Input
                          isDisabled={preview}
                          isInvalid={Boolean(errors.clientEmail)}
                          label="Correo (opcional)"
                          type="email"
                          errorMessage={errors.clientEmail?.message}
                          {...register("clientEmail")}
                        />
                      </div>
                      <Button
                        color="primary"
                        endContent={<ArrowUpRight size={17} />}
                        isDisabled={preview}
                        isLoading={isSubmitting}
                        type="submit"
                      >
                        {preview ? "Reserva disponible al publicar" : "Confirmar cita"}
                      </Button>
                    </form>
                  ) : null}
                </div>
              </div>
            )}
            {message ? (
              <div className="flex flex-wrap items-center gap-3">
                <p
                  aria-live="polite"
                  className={`flex items-center gap-2 text-sm font-medium ${messageTone === "danger" ? "text-danger" : "text-[var(--landing-primary)]"}`}
                >
                  <CheckCircle2 size={17} />
                  {message}
                </p>
                {confirmationUrl ? (
                  <a
                    className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1fbd5b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#128C7E]"
                    href={confirmationUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <MessageCircle size={16} />
                    Abrir WhatsApp con confirmación
                  </a>
                ) : null}
              </div>
            ) : null}
          </CardBody>
        </Card>
      </div>
    </section>
  );
}

"use client";

import {
  Bell,
  CalendarDays,
  Check,
  Globe2,
  Image as ImageIcon,
  Link2,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Chip,
  Divider,
  Input,
  Textarea,
} from "@heroui/react";
import { useFCM } from "@/lib/hooks/useFCM";

const weekdays = [
  ["monday", "Lunes"],
  ["tuesday", "Martes"],
  ["wednesday", "Miércoles"],
  ["thursday", "Jueves"],
  ["friday", "Viernes"],
  ["saturday", "Sábado"],
  ["sunday", "Domingo"],
] as const;

function SettingsContent() {
  const searchParams = useSearchParams();
  const googleStatus = searchParams.get("google");
  const googleDetail = searchParams.get("detail");

  const [form, setForm] = useState({
    name: "",
    logoUrl: "",
    faviconUrl: "",
    seoTitle: "",
    seoDescription: "",
    whatsapp: "",
    instagram: "",
    facebookPixel: "",
    googleCalendarConnected: false,
  });
  const [businessHours, setBusinessHours] = useState<
    Record<string, { open: string; close: string; enabled: boolean }>
  >({});
  const [message, setMessage] = useState<string | null>(null);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(
    null,
  );
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const { enable, enabled, loading: notificationLoading } = useFCM();

  const handleFileUpload = async (
    file: File,
    field: "logoUrl" | "faviconUrl",
  ) => {
    const isLogo = field === "logoUrl";
    if (isLogo) setUploadingLogo(true);
    else setUploadingFavicon(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.data?.url) {
        setForm((prev) => ({ ...prev, [field]: data.data.url }));
        setMessage("Imagen subida con éxito.");
      } else {
        setMessage(data.error || "Error al subir imagen.");
      }
    } catch {
      setMessage("Error de conexión al subir la imagen.");
    } finally {
      if (isLogo) setUploadingLogo(false);
      else setUploadingFavicon(false);
    }
  };
  useEffect(() => {
    void fetch("/api/business/settings")
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          setForm((current) => ({ ...current, ...result.data.business }));
          setBusinessHours(result.data.businessHours);
        }
      });
  }, []);
  const save = async () => {
    const response = await fetch("/api/business/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, businessHours }),
    });
    const result = await response.json();
    setMessage(result.success ? "Cambios guardados." : result.error);
  };
  const disconnectGoogle = async () => {
    await fetch("/api/auth/google/disconnect", { method: "DELETE" });
    setForm({ ...form, googleCalendarConnected: false });
  };
  const enableNotifications = async () => {
    const wasEnabled = await enable();
    setNotificationMessage(
      wasEnabled
        ? "Notificaciones activadas."
        : "No se pudo activar el permiso en este navegador.",
    );
  };
  return (
    <section className="max-w-5xl space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--app-primary)]">
            Configuración
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
            Tu negocio
          </h1>
          <p className="mt-2 text-[var(--app-muted)]">
            La información que tus clientes verán al reservar.
          </p>
        </div>
        <Button
          color="primary"
          startContent={<Save size={16} />}
          onPress={() => void save()}
        >
          Guardar cambios
        </Button>
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <Card className="border border-[var(--app-line)] shadow-none">
            <CardHeader className="gap-3 px-6 pb-0 pt-6">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
                <Globe2 size={18} />
              </span>
              <div>
                <p className="font-semibold">Identidad pública</p>
                <p className="text-xs text-[var(--app-muted)]">
                  Presentación y descubrimiento.
                </p>
              </div>
            </CardHeader>
            <CardBody className="grid gap-4 p-6 sm:grid-cols-2">
              <Input
                label="Nombre"
                value={form.name}
                onValueChange={(value) => setForm({ ...form, name: value })}
              />
              <div className="flex flex-col gap-2 rounded-xl border border-[var(--app-line)] bg-[var(--app-canvas)] p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-[var(--app-muted)]">
                    Logo del negocio
                  </span>
                  {form.logoUrl ? (
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="danger"
                      aria-label="Eliminar logo"
                      onPress={() => setForm((prev) => ({ ...prev, logoUrl: "" }))}
                    >
                      <Trash2 size={14} />
                    </Button>
                  ) : null}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--app-line)] bg-white">
                    {form.logoUrl ? (
                      <img
                        src={form.logoUrl}
                        alt="Logo"
                        className="size-full object-contain p-1"
                      />
                    ) : (
                      <ImageIcon className="text-[var(--app-muted)]" size={22} />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleFileUpload(file, "logoUrl");
                      }}
                    />
                    <Button
                      size="sm"
                      variant="flat"
                      color="primary"
                      isLoading={uploadingLogo}
                      startContent={<Upload size={14} />}
                      onPress={() => logoInputRef.current?.click()}
                    >
                      {form.logoUrl ? "Cambiar imagen" : "Subir logo"}
                    </Button>
                    <Input
                      size="sm"
                      placeholder="O pega una URL de logo"
                      value={form.logoUrl}
                      onValueChange={(value) =>
                        setForm((prev) => ({ ...prev, logoUrl: value }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 rounded-xl border border-[var(--app-line)] bg-[var(--app-canvas)] p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-[var(--app-muted)]">
                    Favicon (icono de pestaña)
                  </span>
                  {form.faviconUrl ? (
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="danger"
                      aria-label="Eliminar favicon"
                      onPress={() => setForm((prev) => ({ ...prev, faviconUrl: "" }))}
                    >
                      <Trash2 size={14} />
                    </Button>
                  ) : null}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--app-line)] bg-white">
                    {form.faviconUrl ? (
                      <img
                        src={form.faviconUrl}
                        alt="Favicon"
                        className="size-8 object-contain"
                      />
                    ) : (
                      <Globe2 className="text-[var(--app-muted)]" size={22} />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5">
                    <input
                      ref={faviconInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleFileUpload(file, "faviconUrl");
                      }}
                    />
                    <Button
                      size="sm"
                      variant="flat"
                      color="primary"
                      isLoading={uploadingFavicon}
                      startContent={<Upload size={14} />}
                      onPress={() => faviconInputRef.current?.click()}
                    >
                      {form.faviconUrl ? "Cambiar icono" : "Subir favicon"}
                    </Button>
                    <Input
                      size="sm"
                      placeholder="O pega una URL de favicon"
                      value={form.faviconUrl}
                      onValueChange={(value) =>
                        setForm((prev) => ({ ...prev, faviconUrl: value }))
                      }
                    />
                  </div>
                </div>
              </div>
              <Input
                label="Título SEO"
                value={form.seoTitle}
                onValueChange={(value) => setForm({ ...form, seoTitle: value })}
              />
              <Input
                label="WhatsApp"
                value={form.whatsapp}
                onValueChange={(value) => setForm({ ...form, whatsapp: value })}
              />
              <Textarea
                className="sm:col-span-2"
                label="Descripción SEO"
                minRows={3}
                value={form.seoDescription}
                onValueChange={(value) =>
                  setForm({ ...form, seoDescription: value })
                }
              />
              <Input
                label="Instagram URL"
                startContent={
                  <Link2 className="text-[var(--app-muted)]" size={16} />
                }
                value={form.instagram}
                onValueChange={(value) =>
                  setForm({ ...form, instagram: value })
                }
              />
              <Input
                label="Facebook Pixel ID"
                value={form.facebookPixel}
                onValueChange={(value) =>
                  setForm({ ...form, facebookPixel: value })
                }
              />
            </CardBody>
          </Card>
          <Card className="border border-[var(--app-line)] shadow-none">
            <CardHeader className="gap-3 px-6 pb-0 pt-6">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[#eef1f8] text-[#53658f]">
                <CalendarDays size={18} />
              </span>
              <div>
                <p className="font-semibold">Horarios de atención</p>
                <p className="text-xs text-[var(--app-muted)]">
                  La disponibilidad de tu agenda usa esta base.
                </p>
              </div>
            </CardHeader>
            <CardBody className="gap-2 p-6">
              {weekdays.map(([key, label]) => {
                const hours = businessHours[key] || {
                  open: "09:00",
                  close: "18:00",
                  enabled: false,
                };
                return (
                  <div
                    className="grid items-center gap-3 border-b border-[var(--app-line)] py-3 last:border-0 sm:grid-cols-[130px_minmax(0,1fr)_minmax(0,1fr)]"
                    key={key}
                  >
                    <Checkbox
                      isSelected={hours.enabled}
                      onValueChange={(enabledValue) =>
                        setBusinessHours({
                          ...businessHours,
                          [key]: { ...hours, enabled: enabledValue },
                        })
                      }
                    >
                      {label}
                    </Checkbox>
                    <Input
                      aria-label={`${label} abre`}
                      className={!hours.enabled ? "opacity-50" : ""}
                      isDisabled={!hours.enabled}
                      type="time"
                      value={hours.open}
                      onValueChange={(open) =>
                        setBusinessHours({
                          ...businessHours,
                          [key]: { ...hours, open },
                        })
                      }
                    />
                    <Input
                      aria-label={`${label} cierra`}
                      className={!hours.enabled ? "opacity-50" : ""}
                      isDisabled={!hours.enabled}
                      type="time"
                      value={hours.close}
                      onValueChange={(close) =>
                        setBusinessHours({
                          ...businessHours,
                          [key]: { ...hours, close },
                        })
                      }
                    />
                  </div>
                );
              })}
            </CardBody>
          </Card>
        </div>
        <div className="space-y-5">
          <Card className="border border-[var(--app-line)] shadow-none">
            <CardHeader className="gap-3 px-5 pb-0 pt-5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[#fff0e8] text-[#c85f3f]">
                <Bell size={18} />
              </span>
              <div>
                <p className="font-semibold">Notificaciones</p>
                <p className="text-xs text-[var(--app-muted)]">
                  Recibe avisos de nuevas citas.
                </p>
              </div>
            </CardHeader>
            <CardBody className="gap-4 p-5">
              <Button
                color={enabled ? "success" : "primary"}
                isLoading={notificationLoading}
                startContent={
                  enabled ? <Check size={16} /> : <Bell size={16} />
                }
                variant={enabled ? "flat" : "solid"}
                onPress={() => void enableNotifications()}
              >
                {enabled ? "Notificaciones activas" : "Activar notificaciones"}
              </Button>
              {notificationMessage ? (
                <p className="text-xs leading-5 text-[var(--app-muted)]">
                  {notificationMessage}
                </p>
              ) : null}
              <Button
                as={Link}
                href="/dashboard/settings/notifications"
                variant="light"
              >
                Configuración avanzada
              </Button>
            </CardBody>
          </Card>
          <Card className="border border-[var(--app-line)] shadow-none">
            <CardHeader className="gap-3 px-5 pb-0 pt-5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[#e5f3f0] text-[#11766f]">
                <CalendarDays size={18} />
              </span>
              <div>
                <p className="font-semibold">Google Calendar</p>
                <p className="text-xs text-[var(--app-muted)]">
                  Evita reservas cruzadas.
                </p>
              </div>
            </CardHeader>
            <CardBody className="gap-3 p-5">
              <Chip
                className="w-fit"
                color={form.googleCalendarConnected ? "success" : "default"}
                size="sm"
                variant="flat"
              >
                {form.googleCalendarConnected ? "Conectado" : "Sin conectar"}
              </Chip>

              {googleStatus === "connected" ? (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs font-medium text-emerald-700">
                  ✓ Google Calendar vinculado exitosamente.
                </div>
              ) : null}

              {googleStatus === "missing_credentials" ? (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 space-y-1">
                  <p className="font-semibold">⚠️ Credenciales no encontradas</p>
                  <p>
                    Configura <code>GOOGLE_CLIENT_ID</code> y <code>GOOGLE_CLIENT_SECRET</code> en tu archivo <code>.env.local</code> para habilitar la sincronización.
                  </p>
                </div>
              ) : null}

              {googleStatus === "error" ? (
                <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 space-y-1">
                  <p className="font-semibold">❌ No se pudo conectar</p>
                  <p>
                    {googleDetail ||
                      "Verifica que la URI de redirección autorizada en Google Cloud Console sea exactamente http://localhost:3000/api/auth/google/callback."}
                  </p>
                </div>
              ) : null}

              <div className="rounded-xl border border-[var(--app-line)] bg-[var(--app-canvas)] p-3 text-xs space-y-2">
                <p className="font-semibold text-default-700">
                  URIs de redireccionamiento requeridas en Google Cloud Console:
                </p>
                <div className="space-y-1">
                  <code className="block bg-white p-2 rounded border border-[var(--app-line)] text-[11px] select-all break-all text-default-700 font-mono">
                    {typeof window !== "undefined"
                      ? `${window.location.origin}/api/auth/google/callback`
                      : "http://localhost:3000/api/auth/google/callback"}
                  </code>
                  {typeof window !== "undefined" && window.location.port !== "3000" && (
                    <code className="block bg-white p-2 rounded border border-[var(--app-line)] text-[11px] select-all break-all text-default-500 font-mono">
                      http://localhost:3000/api/auth/google/callback
                    </code>
                  )}
                </div>
                <p className="text-[11px] leading-relaxed text-default-500">
                  Ve a <strong>Google Cloud Console &gt; APIs y servicios &gt; Credenciales</strong>, haz clic en tu ID de cliente OAuth y agrega la URI exacta en la lista de <strong>URIs de redireccionamiento autorizados</strong>. Guarda los cambios antes de volver a presionar el botón.
                </p>
              </div>

              <Button
                color="primary"
                variant={form.googleCalendarConnected ? "bordered" : "solid"}
                onPress={() => {
                  window.location.assign("/api/auth/google");
                }}
              >
                {form.googleCalendarConnected
                  ? "Reconectar con Google"
                  : "Conectar Google Calendar"}
              </Button>
              {form.googleCalendarConnected ? (
                <Button
                  color="danger"
                  variant="light"
                  onPress={() => void disconnectGoogle()}
                >
                  Desconectar
                </Button>
              ) : null}
            </CardBody>
          </Card>
        </div>
      </div>
      {message ? (
        <p className="text-sm text-[var(--app-primary)]">{message}</p>
      ) : null}
    </section>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-[var(--app-muted)]">
          Cargando configuración…
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}

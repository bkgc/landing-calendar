"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import {
  Button,
  Card,
  CardBody,
  Input,
  Progress,
  Select,
  SelectItem,
  Spinner,
} from "@/components/ui";
import { BUSINESS_CATEGORIES, type BusinessCategory } from "@/types/business";
import { getAuthErrorMessage } from "@/lib/auth/errors";
import {
  completeOnboarding,
  isSlugAvailable,
  SlugUnavailableError,
} from "@/lib/firebase/firestore";
import { useAuth } from "@/lib/hooks/useAuth";
import { SLUG_PATTERN, slugify } from "@/lib/utils/slugify";

const onboardingSchema = z.object({
  businessName: z.string().trim().min(2, "Escribe el nombre de tu negocio."),
  category: z.enum(BUSINESS_CATEGORIES, {
    message: "Selecciona una categoría.",
  }),
  slug: z
    .string()
    .min(3, "El enlace debe tener al menos 3 caracteres.")
    .max(30, "El enlace puede tener hasta 30 caracteres.")
    .regex(SLUG_PATTERN, "Usa minúsculas, números y guiones."),
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

const categoryLabels: Record<BusinessCategory, string> = {
  barberia: "Barbería",
  belleza: "Belleza y uñas",
  bienestar: "Spa y bienestar",
  consultoria: "Consultoría",
  salud: "Salud y consultorio",
  otro: "Otro servicio",
};

export function OnboardingForm() {
  const [error, setError] = useState<string | null>(null);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugStatus, setSlugStatus] = useState<
    "available" | "idle" | "unavailable"
  >("idle");
  const [step, setStep] = useState(0);
  const slugWasEdited = useRef(false);
  const router = useRouter();
  const { loading, refresh, user } = useAuth();
  const form = useForm<OnboardingValues>({
    defaultValues: { businessName: "", category: undefined, slug: "" },
    resolver: zodResolver(onboardingSchema),
  });

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, router, user]);

  const validateSlug = async (): Promise<boolean> => {
    const isValid = await form.trigger("slug");
    if (!isValid) {
      return false;
    }

    setIsCheckingSlug(true);
    setSlugStatus("idle");

    try {
      const available = await isSlugAvailable(form.getValues("slug"));
      setSlugStatus(available ? "available" : "unavailable");
      if (!available) {
        form.setError("slug", { message: "Ese enlace ya está en uso." });
      }
      return available;
    } catch (caughtError) {
      setError(getAuthErrorMessage(caughtError));
      return false;
    } finally {
      setIsCheckingSlug(false);
    }
  };

  const moveForward = async () => {
    setError(null);
    if (step === 0) {
      const nameIsValid = await form.trigger("businessName");
      if (nameIsValid && (await validateSlug())) {
        setStep(1);
      }
      return;
    }

    if (step === 1 && (await form.trigger("category"))) {
      setStep(2);
    }
  };

  const finishOnboarding = async () => {
    if (!user) {
      return;
    }

    setError(null);
    const isValid = await form.trigger();
    if (!isValid || !(await validateSlug())) {
      setStep(0);
      return;
    }

    try {
      await completeOnboarding(user, form.getValues());
      await refresh();
      router.replace("/dashboard");
    } catch (caughtError) {
      if (caughtError instanceof SlugUnavailableError) {
        form.setError("slug", { message: caughtError.message });
        setSlugStatus("unavailable");
        setStep(0);
      } else {
        setError(getAuthErrorMessage(caughtError));
      }
    }
  };

  if (loading || !user) {
    return <Spinner label="Preparando tu onboarding…" />;
  }

  return (
    <div className="min-h-screen bg-[var(--app-canvas)] px-5 py-8 sm:py-12">
      <Card className="mx-auto w-full max-w-2xl border border-[var(--app-line)] shadow-[0_24px_70px_rgba(23,32,37,0.08)]">
        <CardBody className="gap-7 p-6 sm:p-10">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--app-primary)]">
              Paso {step + 1} de 3
            </p>
            <h1 className="text-3xl font-bold">Configuremos tu espacio</h1>
            <p className="text-default-500">
              Solo necesitamos algunos datos para dejar lista tu cuenta.
            </p>
          </div>
          <Progress
            aria-label={`Paso ${step + 1} de 3`}
            color="primary"
            value={(step + 1) * 33.33}
          />
          {step === 0 ? (
            <div className="flex flex-col gap-5">
              <Controller
                control={form.control}
                name="businessName"
                render={({ field, fieldState }) => (
                  <Input
                    isInvalid={Boolean(fieldState.error)}
                    label="Nombre de tu negocio"
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      if (!slugWasEdited.current) {
                        form.setValue("slug", slugify(value), {
                          shouldValidate: true,
                        });
                      }
                    }}
                    errorMessage={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="slug"
                render={({ field, fieldState }) => (
                  <Input
                    description="Será la dirección pública de tu agenda."
                    errorMessage={fieldState.error?.message}
                    isInvalid={Boolean(fieldState.error)}
                    label="Tu enlace"
                    startContent={
                      <span className="text-default-400">agendapro.com/</span>
                    }
                    value={field.value}
                    onBlur={() => void validateSlug()}
                    onValueChange={(value) => {
                      slugWasEdited.current = true;
                      setSlugStatus("idle");
                      field.onChange(slugify(value));
                    }}
                  />
                )}
              />
              {isCheckingSlug ? (
                <p className="text-sm text-default-500">
                  Revisando disponibilidad…
                </p>
              ) : null}
              {slugStatus === "available" ? (
                <p className="text-sm text-success">
                  El enlace está disponible.
                </p>
              ) : null}
              {slugStatus === "unavailable" ? (
                <p className="text-sm text-danger">
                  El enlace no está disponible.
                </p>
              ) : null}
            </div>
          ) : null}
          {step === 1 ? (
            <Controller
              control={form.control}
              name="category"
              render={({ field, fieldState }) => (
                <Select
                  errorMessage={fieldState.error?.message}
                  isInvalid={Boolean(fieldState.error)}
                  label="¿A qué se dedica tu negocio?"
                  selectedKeys={field.value ? [field.value] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0];
                    field.onChange(selected?.toString() ?? "");
                  }}
                >
                  {BUSINESS_CATEGORIES.map((category) => (
                    <SelectItem key={category}>
                      {categoryLabels[category]}
                    </SelectItem>
                  ))}
                </Select>
              )}
            />
          ) : null}
          {step === 2 ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-[var(--app-line)] bg-[var(--app-canvas)] p-5">
                <p className="font-semibold">Conecta Google Calendar</p>
                <p className="mt-1 text-sm text-default-500">
                  Podrás sincronizar tu calendario para evitar reservas
                  cruzadas. Puedes hacerlo ahora o desde Ajustes después.
                </p>
                <Button
                  as="a"
                  className="mt-4"
                  href="/api/auth/google"
                  variant="bordered"
                >
                  Conectar ahora
                </Button>
              </div>
              <p className="text-sm text-default-500">
                Tu cuenta se creará con una prueba gratuita de 7 días.
              </p>
            </div>
          ) : null}
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <div className="flex justify-between gap-3">
            {step > 0 ? (
              <Button
                variant="flat"
                onPress={() => setStep((current) => current - 1)}
              >
                Volver
              </Button>
            ) : (
              <span />
            )}
            {step < 2 ? (
              <Button
                color="primary"
                isLoading={isCheckingSlug}
                onPress={() => void moveForward()}
              >
                Continuar
              </Button>
            ) : (
              <Button
                color="primary"
                isLoading={form.formState.isSubmitting}
                onPress={() => void finishOnboarding()}
              >
                Finalizar configuración
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

"use client";

import {
  Check,
  CheckCircle2,
  CreditCard,
  Crown,
  ExternalLink,
  QrCode,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

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
  Spinner,
} from "@heroui/react";
import { useAuth } from "@/lib/hooks/useAuth";
import type { PlanDefinition } from "@/lib/libelula/client";

interface PaymentInfo {
  paymentId: string;
  qrUrl: string | null;
  qrImage: string | null;
  checkoutUrl: string | null;
  amount: number;
  currency: string;
  expiresAt: string;
}

export default function BillingPage() {
  const { business, refresh } = useAuth();
  const [plans, setPlans] = useState<PlanDefinition[]>([]);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    void fetch("/api/plans")
      .then((response) => response.json())
      .then((result) => {
        if (result.success) setPlans(result.data);
      });
  }, []);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const verifyPayment = useCallback(
    async (paymentId: string) => {
      setIsChecking(true);
      try {
        const response = await fetch("/api/libelula/check-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId }),
        });
        const result = await response.json();

        if (result.success && result.data.paid) {
          stopPolling();
          setPaymentSuccess(true);
          await refresh();
        } else if (result.success && result.data.expired) {
          stopPolling();
          setErrorMessage("El código QR ha expirado. Por favor genera uno nuevo.");
        }
      } catch {
        // Silencioso en reintentos periódicos
      } finally {
        setIsChecking(false);
      }
    },
    [refresh, stopPolling],
  );

  const startPolling = useCallback(
    (paymentId: string) => {
      stopPolling();
      pollIntervalRef.current = setInterval(() => {
        void verifyPayment(paymentId);
      }, 4000);
    },
    [stopPolling, verifyPayment],
  );

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  const handleSubscribe = async () => {
    setLoadingPayment(true);
    setErrorMessage(null);
    setPaymentSuccess(false);

    try {
      const response = await fetch("/api/libelula/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: "pro" }),
      });
      const result = await response.json();

      if (result.success && result.data) {
        setPaymentInfo(result.data);
        setIsModalOpen(true);
        startPolling(result.data.paymentId);
      } else {
        setErrorMessage(
          result.error || "No se pudo generar la solicitud de pago con Libélula.",
        );
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Error inesperado al conectar con Libélula.",
      );
    } finally {
      setLoadingPayment(false);
    }
  };

  const closeModal = () => {
    stopPolling();
    setIsModalOpen(false);
    setPaymentInfo(null);
  };

  const isProActive =
    business?.plan === "pro" && business?.subscriptionStatus === "active";

  const periodEndFormatted = business?.currentPeriodEnd?.toDate
    ? business.currentPeriodEnd
        .toDate()
        .toLocaleDateString("es-BO", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
    : null;

  const trialEnd = business?.trialEndsAt?.toDate
    ? business.trialEndsAt
        .toDate()
        .toLocaleDateString("es-BO", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
    : null;

  return (
    <section className="max-w-5xl space-y-7">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--app-primary)]">
          Suscripción y Pagos
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
          Elige el plan ideal para tu negocio
        </h1>
        <p className="mt-2 text-[var(--app-muted)]">
          Paga de forma fácil y segura en Bolivia a través de Libélula (QR Simple de cualquier banco o tarjeta).
        </p>
      </div>

      {isProActive ? (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-emerald-800">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white">
            <CheckCircle2 size={20} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-950">
              ¡Tu Plan Pro está activo!
            </p>
            <p className="text-xs text-emerald-700">
              Disfrutas de personal, servicios ilimitados, sincronización con Google Calendar y notificaciones push.
              {periodEndFormatted ? ` Próxima renovación: ${periodEndFormatted}.` : ""}
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        {plans.map((plan) => {
          const isPro = plan.id === "pro";
          const active = business?.plan === plan.id;
          return (
            <Card
              className={`border shadow-none ${isPro ? "border-[var(--app-primary)] bg-[#f0faf8]" : "border-[var(--app-line)] bg-white"}`}
              key={plan.id}
            >
              <CardHeader className="flex items-start justify-between gap-3 px-6 pb-0 pt-6">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex size-10 items-center justify-center rounded-xl ${isPro ? "bg-[var(--app-primary)] text-white" : "bg-[#fff0e8] text-[#c85f3f]"}`}
                  >
                    {isPro ? <Crown size={19} /> : <Sparkles size={19} />}
                  </span>
                  <div>
                    <p className="font-semibold">Plan {plan.name}</p>
                    <p className="text-xs text-[var(--app-muted)]">
                      {isPro
                        ? "Para negocios en movimiento y equipos"
                        : "Para empezar sin costo"}
                    </p>
                  </div>
                </div>
                {active ? (
                  <Chip color="success" size="sm" variant="flat">
                    {isProActive ? "Activo" : "Actual"}
                  </Chip>
                ) : null}
              </CardHeader>
              <CardBody className="gap-5 p-6">
                <p className="text-3xl font-semibold">
                  {plan.price} {plan.currency}
                  <span className="text-sm font-normal text-[var(--app-muted)]">
                    {" "}
                    / mes
                  </span>
                </p>
                <div className="space-y-2 text-sm text-[var(--app-muted)]">
                  <p className="flex items-center gap-2">
                    <Check className="text-[var(--app-primary)]" size={15} />
                    {isPro ? "Hasta 5 profesionales" : "1 profesional"}
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="text-[var(--app-primary)]" size={15} />
                    {isPro ? "Servicios ilimitados" : "Hasta 5 servicios"}
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="text-[var(--app-primary)]" size={15} />
                    {isPro ? "Notificaciones push instantáneas" : "Página pública y agenda web"}
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="text-[var(--app-primary)]" size={15} />
                    {isPro
                      ? "Sin marca de agua AgendaPro"
                      : `Período de prueba hasta ${trialEnd || "pronto"}`}
                  </p>
                </div>
                {isPro && !isProActive ? (
                  <Button
                    className="w-full font-medium"
                    color="primary"
                    isLoading={loadingPayment}
                    startContent={<CreditCard size={16} />}
                    onPress={() => void handleSubscribe()}
                  >
                    Suscribirme con Libélula (QR / Tarjeta)
                  </Button>
                ) : null}
              </CardBody>
            </Card>
          );
        })}
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
          <p className="font-semibold">Ocurrió un inconveniente:</p>
          <p>{errorMessage}</p>
        </div>
      ) : null}

      {/* Modal de Pago con Libélula */}
      <Modal
        backdrop="blur"
        hideCloseButton={false}
        isDismissable={false}
        isOpen={isModalOpen}
        size="md"
        onClose={closeModal}
      >
        <ModalContent className="p-2">
          {paymentSuccess ? (
            <>
              <ModalHeader className="flex flex-col items-center pt-6 text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 mb-2">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  ¡Suscripción Activada!
                </h3>
              </ModalHeader>
              <ModalBody className="text-center text-sm text-default-600 pb-4">
                <p>
                  Hemos recibido tu pago a través de Libélula. Tu cuenta ha sido actualizada al <b>Plan Pro</b> con acceso total.
                </p>
              </ModalBody>
              <ModalFooter className="flex justify-center pb-6">
                <Button color="primary" onPress={closeModal}>
                  Entendido, volver al panel
                </Button>
              </ModalFooter>
            </>
          ) : (
            <>
              <ModalHeader className="flex flex-col items-center pt-6 text-center">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)] mb-2">
                  <QrCode size={22} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Pago QR con Libélula
                </h3>
                <p className="text-xs text-default-500 font-normal">
                  Suscripción Plan Pro: <b>{paymentInfo?.amount || 29} {paymentInfo?.currency || "BOB"}</b> por 1 mes
                </p>
              </ModalHeader>

              <ModalBody className="flex flex-col items-center gap-4 px-6 text-center">
                <p className="text-xs text-default-600 leading-relaxed max-w-sm">
                  1. Abre tu aplicación bancaria (BNB, BCP, Banco Unión, BMSC, Mercantil, Ganadero, etc.).
                  <br />
                  2. Escanea el código QR y confirma el monto.
                  <br />
                  3. El sistema detectará tu pago en tiempo real.
                </p>

                <div className="relative flex size-60 items-center justify-center overflow-hidden rounded-2xl border-2 border-[var(--app-line)] bg-white p-3 shadow-inner">
                  {paymentInfo?.qrImage ? (
                    <img
                      alt="Código QR de Pago Libélula"
                      className="size-full object-contain"
                      src={paymentInfo.qrImage}
                    />
                  ) : paymentInfo?.qrUrl ? (
                    <img
                      alt="Código QR de Pago Libélula"
                      className="size-full object-contain"
                      src={paymentInfo.qrUrl}
                    />
                  ) : (
                    <Spinner color="primary" label="Cargando QR..." />
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-default-400">
                  <Spinner size="sm" />
                  <span>Esperando confirmación del pago bancario...</span>
                </div>
              </ModalBody>

              <ModalFooter className="flex flex-col gap-2.5 pb-6 px-6">
                <Button
                  className="w-full font-semibold"
                  color="primary"
                  isLoading={isChecking}
                  startContent={<RefreshCw size={15} />}
                  onPress={() => {
                    if (paymentInfo) void verifyPayment(paymentInfo.paymentId);
                  }}
                >
                  Verificar pago ahora
                </Button>

                {paymentInfo?.checkoutUrl ? (
                  <Button
                    as="a"
                    className="w-full text-xs"
                    endContent={<ExternalLink size={14} />}
                    href={paymentInfo.checkoutUrl}
                    rel="noreferrer"
                    target="_blank"
                    variant="flat"
                  >
                    Pagar con Tarjeta o Pasarela Web
                  </Button>
                ) : null}

                <Button
                  className="w-full text-xs text-default-400"
                  size="sm"
                  variant="light"
                  onPress={closeModal}
                >
                  Cerrar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </section>
  );
}

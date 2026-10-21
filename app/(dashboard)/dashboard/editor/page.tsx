"use client";

import {
  AlertCircle,
  Blocks,
  Check,
  ExternalLink,
  Eye,
  Monitor,
  Palette,
  Pencil,
  Redo2,
  Save,
  Smartphone,
  Tablet,
  Undo2,
  Wand2,
} from "lucide-react";
import { useEffect, useState } from "react";

import { BlockLibrary } from "@/components/builder/editor/BlockLibrary";
import { Canvas } from "@/components/builder/editor/Canvas";
import { PreviewFrame } from "@/components/builder/editor/PreviewFrame";
import { PropertiesPanel } from "@/components/builder/editor/PropertiesPanel";
import { TemplateLibraryModal } from "@/components/builder/editor/TemplateLibraryModal";
import { ThemePanel } from "@/components/builder/editor/ThemePanel";
import {
  Button,
  Card,
  CardBody,
  Chip,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Spinner,
  Tooltip,
} from "@/components/ui";
import { useAuth } from "@/lib/hooks/useAuth";
import { useLandingEditor } from "@/lib/hooks/useLandingEditor";
import { type BlockType } from "@/types/blocks";
import type { Service } from "@/types/service";
import type { StaffMember } from "@/types/staff";

type PreviewDevice = "desktop" | "tablet" | "mobile";

export default function EditorPage() {
  const { business } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [previewMode, setPreviewMode] = useState(false);
  const [isLibraryOpen, setLibraryOpen] = useState(false);
  const [isTemplatesOpen, setTemplatesOpen] = useState(false);
  const {
    loading,
    saving,
    load,
    save,
    addBlock,
    applyTemplate,
    undo,
    redo,
    past,
    future,
    saveState,
    saveError,
    lastSavedAt,
    config,
    selectedBlockId,
    select,
  } = useLandingEditor();

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void Promise.all([
      fetch("/api/business/services").then((response) => response.json()),
      fetch("/api/business/staff").then((response) => response.json()),
    ]).then(([servicesResult, staffResult]) => {
      if (servicesResult.success) setServices(servicesResult.data);
      if (staffResult.success) setStaff(staffResult.data);
    });
  }, []);

  if (loading || !business) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner color="primary" label="Cargando editor" />
      </div>
    );
  }

  const statusColor =
    saveState === "error"
      ? "danger"
      : saveState === "saving"
        ? "warning"
        : saveState === "saved"
          ? "success"
          : "default";
  const statusLabel =
    saveState === "saving"
      ? "Guardando"
      : saveState === "error"
        ? "Error al guardar"
        : saveState === "saved"
          ? "Guardado"
          : "Cambios pendientes";
  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--app-primary)]">
            Editor de landing
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
            Diseña tu página
          </h1>
          <p className="mt-2 max-w-2xl text-[var(--app-muted)]">
            Construye la página que verán tus clientes y comprueba cada cambio
            con una vista responsive.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Chip
            color={statusColor}
            size="sm"
            startContent={
              saveState === "error" ? (
                <AlertCircle size={14} />
              ) : (
                <Check size={14} />
              )
            }
            variant="flat"
          >
            {statusLabel}
          </Chip>
          <Tooltip content="Deshacer">
            <Button
              isIconOnly
              aria-label="Deshacer"
              isDisabled={!past.length || saving}
              variant="flat"
              onPress={undo}
            >
              <Undo2 size={17} />
            </Button>
          </Tooltip>
          <Tooltip content="Rehacer">
            <Button
              isIconOnly
              aria-label="Rehacer"
              isDisabled={!future.length || saving}
              variant="flat"
              onPress={redo}
            >
              <Redo2 size={17} />
            </Button>
          </Tooltip>
          <Button
            startContent={
              previewMode ? <Pencil size={16} /> : <Eye size={16} />
            }
            variant={previewMode ? "solid" : "bordered"}
            onPress={() => setPreviewMode((value) => !value)}
          >
            {previewMode ? "Editar" : "Vista previa"}
          </Button>
          <Button
            as="a"
            className="hidden sm:flex"
            endContent={<ExternalLink size={16} />}
            href={business.slug ? `/${business.slug}` : "#"}
            isDisabled={!business.slug}
            target="_blank"
            variant="bordered"
          >
            Ver página
          </Button>
          <Button
            color="primary"
            isLoading={saving}
            startContent={<Save size={16} />}
            onPress={() => void save()}
          >
            Guardar ahora
          </Button>
        </div>
      </div>

      {saveError ? (
        <p className="rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger">
          {saveError}
        </p>
      ) : null}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="min-w-0 border border-[var(--app-line)] shadow-none">
          <CardBody className="gap-5 p-4 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">
                  {previewMode
                    ? "Previsualización pública"
                    : "Vista de producción"}
                </p>
                <p className="text-sm text-[var(--app-muted)]">
                  {previewMode
                    ? "Así se verá la landing publicada, sin controles del editor."
                    : "Selecciona una sección para editarla. El contenido se muestra como lo verá tu cliente."}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {previewMode ? (
                  <div className="flex items-center gap-1 rounded-lg bg-[var(--app-canvas)] p-1">
                    <Tooltip content="Escritorio">
                      <Button
                        isIconOnly
                        aria-label="Vista escritorio"
                        color={device === "desktop" ? "primary" : "default"}
                        size="sm"
                        variant={device === "desktop" ? "solid" : "light"}
                        onPress={() => setDevice("desktop")}
                      >
                        <Monitor size={16} />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Tablet">
                      <Button
                        isIconOnly
                        aria-label="Vista tablet"
                        color={device === "tablet" ? "primary" : "default"}
                        size="sm"
                        variant={device === "tablet" ? "solid" : "light"}
                        onPress={() => setDevice("tablet")}
                      >
                        <Tablet size={16} />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Móvil">
                      <Button
                        isIconOnly
                        aria-label="Vista móvil"
                        color={device === "mobile" ? "primary" : "default"}
                        size="sm"
                        variant={device === "mobile" ? "solid" : "light"}
                        onPress={() => setDevice("mobile")}
                      >
                        <Smartphone size={16} />
                      </Button>
                    </Tooltip>
                  </div>
                ) : null}
                <Button
                  size="sm"
                  startContent={<Wand2 size={16} />}
                  variant="flat"
                  onPress={() => setTemplatesOpen(true)}
                >
                  Plantillas
                </Button>
                <Button
                  size="sm"
                  startContent={<Blocks size={16} />}
                  variant="flat"
                  onPress={() => setLibraryOpen(true)}
                >
                  Bloques
                </Button>
                <Button
                  color={selectedBlockId ? "default" : "primary"}
                  size="sm"
                  startContent={<Palette size={16} />}
                  variant={selectedBlockId ? "flat" : "solid"}
                  onPress={() => select(null)}
                >
                  Tema
                </Button>
              </div>
            </div>
            <Divider />
            <div className="border border-dashed border-[#b8dcd6] bg-[var(--app-canvas)] p-3 sm:p-4">
              {previewMode ? (
                <PreviewFrame
                  business={business}
                  config={config}
                  device={device}
                  services={services}
                  staff={staff}
                />
              ) : (
                <Canvas business={business} services={services} staff={staff} />
              )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--app-muted)]">
              <span>
                {previewMode
                  ? "El preview usa el ancho real del dispositivo seleccionado."
                  : "Arrastra desde el asa para reordenar bloques."}
              </span>
              <span>
                {lastSavedAt
                  ? `Último guardado: ${lastSavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                  : "Los cambios se guardan automáticamente; puedes guardar ahora en cualquier momento."}
              </span>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-[var(--app-line)] shadow-none xl:sticky xl:top-24">
          <CardBody className="p-5 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto">
            {selectedBlockId ? <PropertiesPanel /> : <ThemePanel />}
          </CardBody>
        </Card>
      </div>

      <Modal
        isOpen={isLibraryOpen}
        size="2xl"
        onOpenChange={setLibraryOpen}
      >
        <ModalContent>
          <ModalHeader>Añade una sección</ModalHeader>
          <ModalBody className="pb-6">
            <BlockLibrary
              onAdd={(type: BlockType) => {
                addBlock(type);
                setPreviewMode(false);
                setLibraryOpen(false);
              }}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      <TemplateLibraryModal
        isOpen={isTemplatesOpen}
        onOpenChange={setTemplatesOpen}
        onApply={(template) => {
          applyTemplate(template.config);
          setPreviewMode(false);
        }}
      />
    </section>
  );
}

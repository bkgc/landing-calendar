"use client";

import { Check, Sparkles, Wand2 } from "lucide-react";
import { useState } from "react";

import {
  Button,
  Card,
  CardBody,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@/components/ui";
import {
  LANDING_TEMPLATES,
  type LandingTemplate,
} from "@/lib/templates/landing-templates";

interface TemplateLibraryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (template: LandingTemplate) => void;
}

export function TemplateLibraryModal({
  isOpen,
  onOpenChange,
  onApply,
}: TemplateLibraryModalProps) {
  const [selectedTemplate, setSelectedTemplate] =
    useState<LandingTemplate | null>(null);

  const handleConfirm = () => {
    if (selectedTemplate) {
      onApply(selectedTemplate);
      setSelectedTemplate(null);
      onOpenChange(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      size="4xl"
      scrollBehavior="inside"
      onOpenChange={(open) => {
        if (!open) setSelectedTemplate(null);
        onOpenChange(open);
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 pb-2">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
              <Wand2 size={18} />
            </span>
            <span className="text-xl font-bold">Plantillas Prediseñadas</span>
          </div>
          <p className="text-xs font-normal text-[var(--app-muted)]">
            Aplica una estructura lista para usar optimizada para negocios bolivianos. Siempre podrás personalizar textos, colores y secciones.
          </p>
        </ModalHeader>

        <ModalBody className="py-4">
          <div className="grid gap-4 md:grid-cols-2">
            {LANDING_TEMPLATES.map((tmpl) => {
              const isSelected = selectedTemplate?.id === tmpl.id;
              return (
                <Card
                  key={tmpl.id}
                  isPressable
                  className={`border text-left transition-all hover:scale-[1.01] ${
                    isSelected
                      ? "border-[var(--app-primary)] ring-2 ring-[var(--app-primary)]/20 bg-[var(--app-primary-soft)]/10"
                      : "border-[var(--app-line)] bg-white shadow-xs"
                  }`}
                  onPress={() => setSelectedTemplate(tmpl)}
                >
                  <CardBody className="gap-3.5 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{tmpl.icon}</span>
                        <div>
                          <h3 className="font-semibold text-base leading-tight">
                            {tmpl.name}
                          </h3>
                          <span className="text-xs text-[var(--app-muted)]">
                            {tmpl.category}
                          </span>
                        </div>
                      </div>
                      <Chip
                        size="sm"
                        variant="flat"
                        style={{
                          backgroundColor: `${tmpl.previewColor}18`,
                          color: tmpl.previewColor,
                        }}
                      >
                        {tmpl.badge}
                      </Chip>
                    </div>

                    <p className="text-xs leading-relaxed text-[var(--app-muted)]">
                      {tmpl.description}
                    </p>

                    <div className="space-y-2 border-t border-[var(--app-line)] pt-3">
                      <div className="flex items-center justify-between text-xs text-[var(--app-muted)]">
                        <span className="font-medium">Paleta y Fuente:</span>
                        <div className="flex items-center gap-2">
                          <span
                            className="size-3.5 rounded-full border border-black/10 inline-block"
                            style={{ backgroundColor: tmpl.config.theme.primary }}
                            title="Color Primario"
                          />
                          <span
                            className="size-3.5 rounded-full border border-black/10 inline-block"
                            style={{ backgroundColor: tmpl.config.theme.background }}
                            title="Color de Fondo"
                          />
                          <span className="font-mono text-[11px] text-[var(--app-ink)]">
                            {tmpl.config.theme.font}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {tmpl.config.blocks.map((b) => (
                          <Chip
                            key={b.id}
                            size="sm"
                            variant="flat"
                            color="default"
                            className="text-[10px] h-5"
                          >
                            {b.type}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>

          {selectedTemplate && (
            <div className="mt-4 rounded-xl border border-warning-200 bg-warning-50 p-4 text-xs text-warning-800 flex items-start gap-3">
              <Sparkles size={18} className="shrink-0 text-warning-600 mt-0.5" />
              <div>
                <p className="font-semibold">
                  ¿Aplicar la plantilla &quot;{selectedTemplate.name}&quot;?
                </p>
                <p className="mt-0.5 opacity-90">
                  Esto reconfigurará los bloques y estilos de tu página con este diseño. Si quieres volver atrás después, podrás usar el botón de <strong>Deshacer</strong> en la barra de herramientas.
                </p>
              </div>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            variant="flat"
            onPress={() => {
              setSelectedTemplate(null);
              onOpenChange(false);
            }}
          >
            Cancelar
          </Button>
          <Button
            color="primary"
            isDisabled={!selectedTemplate}
            startContent={<Check size={16} />}
            onPress={handleConfirm}
          >
            Aplicar plantilla
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

"use client";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Film,
  Image as ImageIcon,
  Layout,
  Sparkles,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Chip,
  Input,
  Select,
  SelectItem,
  SelectSection,
  Slider,
} from "@/components/ui";
import { compressImage } from "@/lib/utils/image-compression";

const GRADIENT_PRESETS = [
  {
    name: "Esmeralda Profundo",
    value: "linear-gradient(135deg, #064e3b 0%, #0f766e 100%)",
  },
  {
    name: "Océano Moderno",
    value: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0284c7 100%)",
  },
  {
    name: "Sunset Cálido",
    value: "linear-gradient(135deg, #991b1b 0%, #ea580c 50%, #f59e0b 100%)",
  },
  {
    name: "Medianoche Elegante",
    value: "linear-gradient(135deg, #09090b 0%, #18181b 50%, #27272a 100%)",
  },
  {
    name: "Aurora Pastel",
    value: "linear-gradient(135deg, #f0fdf4 0%, #ecfeff 50%, #fdf4ff 100%)",
  },
  {
    name: "Amatista & Índigo",
    value: "linear-gradient(135deg, #312e81 0%, #4c1d95 50%, #701a75 100%)",
  },
];

interface BlockStylePropertiesProps {
  props: Record<string, unknown>;
  set: (key: string, value: unknown) => void;
}

export function BlockStyleProperties({ props, set }: BlockStylePropertiesProps) {
  const bgType = (props.bgType as string) || "default";
  const bgColor = (props.bgColor as string) || "#ffffff";
  const bgGradient = (props.bgGradient as string) || GRADIENT_PRESETS[0].value;
  const bgImageUrl = (props.bgImageUrl as string) || "";
  const bgOverlayOpacity =
    typeof props.bgOverlayOpacity === "number" ? props.bgOverlayOpacity : 50;
  const textColor = (props.textColor as string) || "default";
  const animation = (props.animation as string) || "none";
  const align = (props.align as string) || "left";
  const padding = (props.padding as string) || "md";

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const optimizedFile = await compressImage(file);
      const formData = new FormData();
      formData.append("file", optimizedFile);
      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.data?.url) {
        set("bgImageUrl", data.data.url);
        set("bgType", "image");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="border border-[var(--app-line)] bg-[var(--app-canvas)] shadow-none">
      <CardBody className="space-y-4 p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="text-[var(--app-primary)]" size={16} />
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">
            Fondo y Estilo de la Sección
          </p>
        </div>

        <Select
          label="Estilo de fondo"
          selectedKeys={[bgType]}
          onSelectionChange={(keys) => {
            const val = String(Array.from(keys)[0] || "default");
            set("bgType", val);
            if (val === "gradient" && !props.bgGradient) {
              set("bgGradient", GRADIENT_PRESETS[0].value);
              set("textColor", "light");
            }
          }}
        >
          <SelectItem key="default">Predeterminado (Tema general)</SelectItem>
          <SelectItem key="solid">Color sólido</SelectItem>
          <SelectItem key="gradient">Degradado</SelectItem>
          <SelectItem key="image">Imagen de fondo</SelectItem>
        </Select>

        {bgType === "solid" ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => set("bgColor", e.target.value)}
                className="size-10 cursor-pointer rounded-lg border border-[var(--app-line)] bg-transparent p-0.5"
              />
              <Input
                label="Código Hexadecimal"
                size="sm"
                value={bgColor}
                onValueChange={(val) => set("bgColor", val)}
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["#ffffff", "#f8fafc", "#f1f5f9", "#e2e8f0", "#11766f", "#0f172a"].map(
                (color) => (
                  <button
                    key={color}
                    type="button"
                    style={{ backgroundColor: color }}
                    className="size-6 rounded-full border border-black/20 transition-transform hover:scale-110"
                    onClick={() => {
                      set("bgColor", color);
                      if (color === "#11766f" || color === "#0f172a") {
                        set("textColor", "light");
                      }
                    }}
                  />
                ),
              )}
            </div>
          </div>
        ) : null}

        {bgType === "gradient" ? (
          <div className="space-y-3">
            <Select
              label="Preset de degradado"
              selectedKeys={[
                GRADIENT_PRESETS.some((p) => p.value === bgGradient)
                  ? bgGradient
                  : "custom",
              ]}
              onSelectionChange={(keys) => {
                const val = String(Array.from(keys)[0]);
                if (val !== "custom") {
                  set("bgGradient", val);
                  set("textColor", "light");
                }
              }}
            >
              {GRADIENT_PRESETS.map((preset) => (
                <SelectItem key={preset.value}>{preset.name}</SelectItem>
              ))}
            </Select>

            <div
              className="h-12 w-full rounded-xl border border-black/10 shadow-xs"
              style={{ backgroundImage: bgGradient }}
            />

            <Input
              label="CSS de degradado personalizado"
              size="sm"
              value={bgGradient}
              onValueChange={(val) => set("bgGradient", val)}
            />
          </div>
        ) : null}

        {bgType === "image" ? (
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleUpload(file);
              }}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="flat"
                color="primary"
                isLoading={uploading}
                startContent={<Upload size={14} />}
                onPress={() => fileInputRef.current?.click()}
              >
                Subir imagen
              </Button>
              <Input
                size="sm"
                placeholder="O pega una URL de imagen"
                value={bgImageUrl}
                onValueChange={(val) => set("bgImageUrl", val)}
              />
            </div>

            {bgImageUrl ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-black/10 bg-black/10">
                <img
                  src={bgImageUrl}
                  alt="Fondo"
                  className="size-full object-cover"
                />
                <div
                  className="absolute inset-0 bg-black"
                  style={{ opacity: bgOverlayOpacity / 100 }}
                />
                <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[11px] text-white">
                  Vista previa con capa oscura
                </span>
              </div>
            ) : null}

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-[var(--app-muted)]">
                <span>Oscurecer fondo (para legibilidad)</span>
                <span>{bgOverlayOpacity}%</span>
              </div>
              <Slider
                aria-label="Opacidad de capa"
                size="sm"
                step={5}
                minValue={0}
                maxValue={95}
                value={bgOverlayOpacity}
                onChange={(val) => set("bgOverlayOpacity", Number(val))}
              />
            </div>
          </div>
        ) : null}

        {bgType !== "default" ? (
          <Select
            label="Contraste de texto"
            selectedKeys={[textColor]}
            onSelectionChange={(keys) =>
              set("textColor", String(Array.from(keys)[0] || "default"))
            }
          >
            <SelectItem key="default">Automático</SelectItem>
            <SelectItem key="light">Texto claro (para fondos oscuros)</SelectItem>
            <SelectItem key="dark">Texto oscuro (para fondos claros)</SelectItem>
          </Select>
        ) : null}

        <div className="pt-2 border-t border-[var(--app-line)] space-y-3">
          <div className="flex items-center gap-2">
            <Film className="text-[var(--app-primary)]" size={16} />
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">
              Animación del Bloque
            </p>
          </div>

          <Select
            label="Efecto visual"
            description="Animación aplicada al bloque en la página pública"
            selectedKeys={[animation]}
            onSelectionChange={(keys) => {
              const val = String(Array.from(keys)[0] || "none");
              set("animation", val);
            }}
          >
            <SelectSection title="Sin animación">
              <SelectItem key="none">Ninguna</SelectItem>
            </SelectSection>
            <SelectSection title="✨ Entrada (Al cargar / scroll)">
              <SelectItem key="fade_in">Desvanecer (Fade In)</SelectItem>
              <SelectItem key="fade_up">Desvanecer hacia arriba (Fade Up)</SelectItem>
              <SelectItem key="slide_left">Deslizar desde la izquierda (Slide Left)</SelectItem>
              <SelectItem key="slide_right">Deslizar desde la derecha (Slide Right)</SelectItem>
              <SelectItem key="zoom_in">Acercar (Zoom In)</SelectItem>
              <SelectItem key="bounce_in">Rebote dinámico (Bounce In)</SelectItem>
              <SelectItem key="flip_in">Giro 3D (Flip In)</SelectItem>
            </SelectSection>
            <SelectSection title="👋 Salida">
              <SelectItem key="fade_out">Desvanecer salida (Fade Out)</SelectItem>
              <SelectItem key="slide_down">Deslizar hacia abajo (Slide Down)</SelectItem>
              <SelectItem key="zoom_out">Alejar salida (Zoom Out)</SelectItem>
            </SelectSection>
            <SelectSection title="🔄 En bucle (Continuas)">
              <SelectItem key="float">Flotación sutil (Float)</SelectItem>
              <SelectItem key="pulse">Pulso suave (Pulse)</SelectItem>
              <SelectItem key="shimmer">Brillo reflectante (Shimmer)</SelectItem>
              <SelectItem key="glow">Resplandor luminoso (Glow)</SelectItem>
              <SelectItem key="bounce_gentle">Rebote continuo (Bounce Gentle)</SelectItem>
              <SelectItem key="spin_slow">Rotación continua lenta (Spin Slow)</SelectItem>
            </SelectSection>
          </Select>
        </div>

        <div className="pt-2 border-t border-[var(--app-line)] space-y-3">
          <div className="flex items-center gap-2">
            <Layout className="text-[var(--app-primary)]" size={16} />
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">
              Posición y Espaciado
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Alineación"
              selectedKeys={[align]}
              onSelectionChange={(keys) => {
                const val = String(Array.from(keys)[0] || "left");
                set("align", val);
              }}
            >
              <SelectItem key="left" startContent={<AlignLeft size={15} />}>
                Izquierda
              </SelectItem>
              <SelectItem key="center" startContent={<AlignCenter size={15} />}>
                Centrado
              </SelectItem>
              <SelectItem key="right" startContent={<AlignRight size={15} />}>
                Derecha
              </SelectItem>
            </Select>

            <Select
              label="Espaciado vertical"
              selectedKeys={[padding]}
              onSelectionChange={(keys) => {
                const val = String(Array.from(keys)[0] || "md");
                set("padding", val);
              }}
            >
              <SelectItem key="none">Sin espaciado</SelectItem>
              <SelectItem key="sm">Compacto (Pequeño)</SelectItem>
              <SelectItem key="md">Normal (Mediano)</SelectItem>
              <SelectItem key="lg">Amplio (Grande)</SelectItem>
              <SelectItem key="xl">Extra amplio</SelectItem>
            </Select>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

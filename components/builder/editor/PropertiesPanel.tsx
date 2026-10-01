"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { type ReactNode, useState } from "react";

import {
  Button,
  Card,
  CardBody,
  Input,
  Select,
  SelectItem,
  Textarea,
} from "@/components/ui";
import { BlockStyleProperties } from "@/components/builder/editor/BlockStyleProperties";
import { CarouselProperties } from "@/components/builder/editor/CarouselProperties";
import { ContainerProperties } from "@/components/builder/editor/ContainerProperties";
import { useLandingEditor } from "@/lib/hooks/useLandingEditor";
import {
  BLOCK_LABELS,
  type FeatureItem,
  type LandingAnimation,
  type StatItem,
} from "@/types/blocks";
import { compressImage } from "@/lib/utils/image-compression";

type ImageItem = { url: string; alt: string };
type LinkItem = { label: string; href: string };
type TestimonialItem = {
  quote: string;
  name: string;
  avatar?: string;
  stars: number;
};
type FaqItem = { question: string; answer: string };

const animationOptions: Array<[LandingAnimation, string]> = [
  ["none", "Sin animación"],
  ["fade_in", "✨ Entrada: Aparecer suave"],
  ["fade_up", "✨ Entrada: Subir y aparecer"],
  ["slide_left", "✨ Entrada: Desde la derecha"],
  ["slide_right", "✨ Entrada: Desde la izquierda"],
  ["zoom_in", "✨ Entrada: Acercar (Zoom in)"],
  ["bounce_in", "✨ Entrada: Rebote elástico"],
  ["flip_in", "✨ Entrada: Giro 3D"],
  ["float", "🔄 En bucle: Flotar suave"],
  ["pulse", "🔄 En bucle: Pulsación rítmica"],
  ["shimmer", "🔄 En bucle: Brillo deslizante"],
  ["glow", "🔄 En bucle: Resplandor sutil"],
];

function asText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function PropertiesPanel() {
  const { config, selectedBlockId, updateBlock } = useLandingEditor();
  const block = config.blocks.find((item) => item.id === selectedBlockId);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  if (!block) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--app-line)] p-4">
        <p className="text-sm font-medium">Selecciona un bloque</p>
        <p className="mt-1 text-xs leading-5 text-[var(--app-muted)]">
          Elige una sección del lienzo para editar su contenido.
        </p>
      </div>
    );
  }

  const props = block.props as Record<string, unknown>;
  const set = (key: string, value: unknown) =>
    updateBlock(block.id, { [key]: value });
  const upload = async (file: File) => {
    setUploading(true);
    setUploadError("");
    try {
      const optimizedFile = await compressImage(file);
      const body = new FormData();
      body.append("file", optimizedFile);
      const response = await fetch("/api/media/upload", {
        method: "POST",
        body,
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error("upload-failed");
      if (block.type === "gallery") {
        set("images", [
          ...asArray<ImageItem>(props.images),
          { url: result.data.url, alt: "" },
        ]);
      } else if (block.type === "navbar") {
        set("logoUrl", result.data.url);
      } else if (block.type === "image_carousel") {
        set("images", [
          ...asArray<ImageItem>(props.images),
          { url: result.data.url, alt: "" },
        ]);
      } else {
        set("imageUrl", result.data.url);
      }
    } catch {
      setUploadError("No se pudo subir la imagen.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{BLOCK_LABELS[block.type]}</h2>
        <p className="mt-1 text-xs leading-5 text-[var(--app-muted)]">
          Edita el contenido y los cambios se guardarán automáticamente.
        </p>
      </div>

      {block.type !== "navbar" ? (
        <BlockStyleProperties props={props} set={set} />
      ) : null}

      {block.type === "hero" ? (
        <>
          <Input
            label="Insignia / Eyebrow (opcional)"
            placeholder="Ej: Nuevo, Exclusivo, o nombre del negocio"
            value={asText(props.badgeText)}
            onValueChange={(value) => set("badgeText", value)}
          />
          <Input
            label="Título"
            value={asText(props.title)}
            onValueChange={(value) => set("title", value)}
          />
          <Textarea
            label="Subtítulo"
            value={asText(props.subtitle)}
            onValueChange={(value) => set("subtitle", value)}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Texto botón principal"
              value={asText(props.ctaText)}
              onValueChange={(value) => set("ctaText", value)}
            />
            <Input
              label="Enlace botón principal"
              value={asText(props.ctaHref)}
              onValueChange={(value) => set("ctaHref", value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Texto botón secundario (opcional)"
              placeholder="Ej: Ver catálogo"
              value={asText(props.secondaryCtaText)}
              onValueChange={(value) => set("secondaryCtaText", value)}
            />
            <Input
              label="Enlace botón secundario"
              placeholder="#servicios"
              value={asText(props.secondaryCtaHref)}
              onValueChange={(value) => set("secondaryCtaHref", value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Select
              label="Composición"
              selectedKeys={[asText(props.layout) || "split"]}
              onSelectionChange={(keys) =>
                set("layout", String(Array.from(keys)[0]))
              }
            >
              <SelectItem key="split">Texto e imagen</SelectItem>
              <SelectItem key="centered">Texto centrado</SelectItem>
              <SelectItem key="image_background">Imagen de fondo</SelectItem>
            </Select>
            <Select
              label="Posición de la imagen"
              isDisabled={props.layout === "centered" || props.layout === "image_background"}
              selectedKeys={[asText(props.imagePosition) || "right"]}
              onSelectionChange={(keys) =>
                set("imagePosition", String(Array.from(keys)[0]))
              }
            >
              <SelectItem key="right">Imagen a la derecha</SelectItem>
              <SelectItem key="left">Imagen a la izquierda</SelectItem>
            </Select>
          </div>
          <ImageField
            value={asText(props.imageUrl)}
            uploading={uploading}
            onChange={(value) => set("imageUrl", value)}
            onUpload={upload}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <AnimationSelect
              label="Animación del texto"
              value={asText(props.textAnimation)}
              onChange={(value) => set("textAnimation", value)}
            />
            <AnimationSelect
              label="Animación de la imagen"
              value={asText(props.imageAnimation)}
              onChange={(value) => set("imageAnimation", value)}
            />
          </div>
        </>
      ) : null}

      {block.type === "navbar" ? (
        <>
          <Select
            label="Disposición de la barra"
            selectedKeys={[asText(props.layout) || "spread"]}
            onSelectionChange={(keys) =>
              set("layout", String(Array.from(keys)[0]))
            }
          >
            <SelectItem key="spread">Estándar distribuido (Logo a la izquierda, menú a la derecha)</SelectItem>
            <SelectItem key="centered">Menú centrado (Enlaces en el centro)</SelectItem>
            <SelectItem key="minimal">Compacto (Solo logo y botón)</SelectItem>
          </Select>
          <Input
            label="Texto del botón"
            value={asText(props.ctaText)}
            onValueChange={(value) => set("ctaText", value)}
          />
          <ImageField
            value={asText(props.logoUrl)}
            uploading={uploading}
            onChange={(value) => set("logoUrl", value)}
            onUpload={upload}
          />
          <ListEditor<LinkItem>
            title="Enlaces del menú"
            items={asArray<LinkItem>(props.links)}
            emptyText="No hay enlaces en el menú."
            addLabel="Añadir enlace"
            createItem={() => ({ label: "Nueva sección", href: "#" })}
            onChange={(items) => set("links", items)}
          >
            {(item, index, update) => (
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  label="Etiqueta"
                  value={item.label}
                  onValueChange={(value) => update(index, { label: value })}
                />
                <Input
                  label="Enlace"
                  value={item.href}
                  onValueChange={(value) => update(index, { href: value })}
                />
              </div>
            )}
          </ListEditor>
        </>
      ) : null}

      {block.type === "services" ? (
        <>
          <AutoContentFields
            props={props}
            set={set}
            fields={["title", "subtitle"]}
            labels={["Título", "Subtítulo"]}
          />
          <Select
            label="Columnas de servicios"
            selectedKeys={[String(props.columns || 3)]}
            onSelectionChange={(keys) =>
              set("columns", Number(Array.from(keys)[0]))
            }
          >
            <SelectItem key="2">2 columnas</SelectItem>
            <SelectItem key="3">3 columnas</SelectItem>
            <SelectItem key="4">4 columnas</SelectItem>
          </Select>
        </>
      ) : null}
      {block.type === "booking_calendar" ? (
        <AutoContentFields
          props={props}
          set={set}
          fields={["title", "subtitle"]}
          labels={["Título", "Subtítulo"]}
        />
      ) : null}
      {block.type === "staff" ? (
        <>
          <AutoContentFields
            props={props}
            set={set}
            fields={["title", "subtitle"]}
            labels={["Título", "Subtítulo"]}
          />
          <Select
            label="Columnas de personal"
            selectedKeys={[String(props.columns || 3)]}
            onSelectionChange={(keys) =>
              set("columns", Number(Array.from(keys)[0]))
            }
          >
            <SelectItem key="2">2 columnas</SelectItem>
            <SelectItem key="3">3 columnas</SelectItem>
            <SelectItem key="4">4 columnas</SelectItem>
          </Select>
        </>
      ) : null}
      {block.type === "footer" ? (
        <>
          <Textarea
            label="Descripción"
            value={asText(props.description)}
            onValueChange={(value) => set("description", value)}
          />
          <Input
            label="Texto del botón"
            value={asText(props.ctaText)}
            onValueChange={(value) => set("ctaText", value)}
          />
        </>
      ) : null}

      {block.type === "text_image" ? (
        <>
          <Input
            label="Insignia / Eyebrow (opcional)"
            placeholder="Ej: Nuestra historia, Exclusivo"
            value={asText(props.badgeText)}
            onValueChange={(value) => set("badgeText", value)}
          />
          <Input
            label="Título"
            value={asText(props.title)}
            onValueChange={(value) => set("title", value)}
          />
          <Textarea
            label="Texto"
            value={asText(props.text)}
            onValueChange={(value) => set("text", value)}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Texto del botón (opcional)"
              placeholder="Ej: Conoce más"
              value={asText(props.ctaText)}
              onValueChange={(value) => set("ctaText", value)}
            />
            <Input
              label="Enlace del botón"
              placeholder="#reservar"
              value={asText(props.ctaHref)}
              onValueChange={(value) => set("ctaHref", value)}
            />
          </div>
          <Select
            label="Posición de la imagen"
            selectedKeys={[asText(props.imagePosition) || "right"]}
            onSelectionChange={(keys) =>
              set("imagePosition", String(Array.from(keys)[0]))
            }
          >
            <SelectItem key="left">A la izquierda</SelectItem>
            <SelectItem key="right">A la derecha</SelectItem>
          </Select>
          <ImageField
            value={asText(props.imageUrl)}
            uploading={uploading}
            onChange={(value) => set("imageUrl", value)}
            onUpload={upload}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <AnimationSelect
              label="Animación del texto"
              value={asText(props.textAnimation)}
              onChange={(value) => set("textAnimation", value)}
            />
            <AnimationSelect
              label="Animación de la imagen"
              value={asText(props.imageAnimation)}
              onChange={(value) => set("imageAnimation", value)}
            />
          </div>
        </>
      ) : null}

      {block.type === "container" ? (
        <ContainerProperties props={props} set={set} />
      ) : null}
      {block.type === "image_carousel" ? (
        <CarouselProperties
          props={props}
          set={set}
          uploading={uploading}
          onUpload={upload}
        />
      ) : null}

      {block.type === "gallery" ? (
        <>
          <Input
            label="Título"
            value={asText(props.title)}
            onValueChange={(value) => set("title", value)}
          />
          <Select
            label="Columnas"
            selectedKeys={[String(props.columns || 3)]}
            onSelectionChange={(keys) =>
              set("columns", Number(Array.from(keys)[0]))
            }
          >
            <SelectItem key="2">2 columnas</SelectItem>
            <SelectItem key="3">3 columnas</SelectItem>
            <SelectItem key="4">4 columnas</SelectItem>
          </Select>
          <ListEditor<ImageItem>
            title="Imágenes"
            items={asArray<ImageItem>(props.images)}
            emptyText="Añade imágenes para mostrar tu espacio."
            addLabel="Añadir imagen"
            createItem={() => ({ url: "", alt: "" })}
            onChange={(items) => set("images", items)}
          >
            {(item, index, update) => (
              <>
                <Input
                  label="URL de imagen"
                  value={item.url}
                  onValueChange={(value) => update(index, { url: value })}
                />
                <Input
                  label="Texto alternativo"
                  value={item.alt}
                  onValueChange={(value) => update(index, { alt: value })}
                />
              </>
            )}
          </ListEditor>
          <UploadInput uploading={uploading} onUpload={upload} />
        </>
      ) : null}

      {block.type === "video_embed" ? (
        <>
          <Input
            label="Título"
            value={asText(props.title)}
            onValueChange={(value) => set("title", value)}
          />
          <Input
            label="URL de YouTube, Shorts, Instagram o TikTok"
            value={asText(props.url)}
            onValueChange={(value) => set("url", value)}
          />
        </>
      ) : null}

      {block.type === "testimonials" ? (
        <>
          <Input
            label="Título"
            value={asText(props.title)}
            onValueChange={(value) => set("title", value)}
          />
          <ListEditor<TestimonialItem>
            title="Testimonios"
            items={asArray<TestimonialItem>(props.testimonials)}
            emptyText="Añade testimonios para generar confianza."
            addLabel="Añadir testimonio"
            createItem={() => ({
              quote: "",
              name: "Cliente",
              avatar: "",
              stars: 5,
            })}
            onChange={(items) => set("testimonials", items)}
          >
            {(item, index, update) => (
              <>
                <Textarea
                  label="Comentario"
                  value={item.quote}
                  onValueChange={(value) => update(index, { quote: value })}
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    label="Nombre"
                    value={item.name}
                    onValueChange={(value) => update(index, { name: value })}
                  />
                  <Select
                    label="Estrellas"
                    selectedKeys={[String(item.stars || 5)]}
                    onSelectionChange={(keys) =>
                      update(index, { stars: Number(Array.from(keys)[0]) })
                    }
                  >
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <SelectItem key={stars}>{stars} estrellas</SelectItem>
                    ))}
                  </Select>
                </div>
                <Input
                  label="Avatar (URL opcional)"
                  value={item.avatar || ""}
                  onValueChange={(value) => update(index, { avatar: value })}
                />
              </>
            )}
          </ListEditor>
        </>
      ) : null}

      {block.type === "faq" ? (
        <>
          <Input
            label="Título"
            value={asText(props.title)}
            onValueChange={(value) => set("title", value)}
          />
          <ListEditor<FaqItem>
            title="Preguntas"
            items={asArray<FaqItem>(props.items)}
            emptyText="Añade las preguntas que más recibe tu negocio."
            addLabel="Añadir pregunta"
            createItem={() => ({ question: "", answer: "" })}
            onChange={(items) => set("items", items)}
          >
            {(item, index, update) => (
              <>
                <Input
                  label="Pregunta"
                  value={item.question}
                  onValueChange={(value) => update(index, { question: value })}
                />
                <Textarea
                  label="Respuesta"
                  value={item.answer}
                  onValueChange={(value) => update(index, { answer: value })}
                />
              </>
            )}
          </ListEditor>
        </>
      ) : null}

      {block.type === "map_contact" ? (
        <>
          <Select
            label="Disposición de elementos"
            selectedKeys={[asText(props.layout) || "split"]}
            onSelectionChange={(keys) =>
              set("layout", String(Array.from(keys)[0]))
            }
          >
            <SelectItem key="split">Contacto a la izquierda / Mapa a la derecha</SelectItem>
            <SelectItem key="map_first">Mapa a la izquierda / Contacto a la derecha</SelectItem>
            <SelectItem key="stacked">Apilado (Mapa abajo)</SelectItem>
          </Select>
          <Input
            label="Título"
            value={asText(props.title)}
            onValueChange={(value) => set("title", value)}
          />
          <Input
            label="Dirección"
            value={asText(props.address)}
            onValueChange={(value) => set("address", value)}
          />
          <Input
            label="URL de Google Maps"
            value={asText(props.mapUrl)}
            onValueChange={(value) => set("mapUrl", value)}
          />
          <Input
            label="WhatsApp"
            value={asText(props.whatsapp)}
            onValueChange={(value) => set("whatsapp", value)}
          />
          <Input
            label="Instagram"
            value={asText(props.instagram)}
            onValueChange={(value) => set("instagram", value)}
          />
        </>
      ) : null}

      {block.type === "features" ? (
        <>
          <Input
            label="Subtítulo superior (Eyebrow)"
            value={asText(props.eyebrow)}
            onValueChange={(value) => set("eyebrow", value)}
          />
          <Input
            label="Título principal"
            value={asText(props.title)}
            onValueChange={(value) => set("title", value)}
          />
          <Textarea
            label="Descripción"
            value={asText(props.subtitle)}
            onValueChange={(value) => set("subtitle", value)}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Select
              label="Columnas"
              selectedKeys={[String(props.columns || 3)]}
              onSelectionChange={(keys) =>
                set("columns", Number(Array.from(keys)[0]))
              }
            >
              <SelectItem key="2">2 columnas</SelectItem>
              <SelectItem key="3">3 columnas</SelectItem>
              <SelectItem key="4">4 columnas</SelectItem>
            </Select>
            <AnimationSelect
              label="Animación"
              value={asText(props.animation)}
              onChange={(value) => set("animation", value)}
            />
          </div>
          <ListEditor<FeatureItem>
            title="Beneficios"
            items={asArray<FeatureItem>(props.items)}
            emptyText="Añade los puntos fuertes o beneficios de tu negocio."
            addLabel="Añadir beneficio"
            createItem={() => ({
              id: `feat-${crypto.randomUUID()}`,
              icon: "sparkles",
              title: "Nuevo beneficio",
              description: "Descripción de la ventaja o valor añadido.",
            })}
            onChange={(items) => set("items", items)}
          >
            {(item, index, update) => (
              <>
                <Input
                  label="Título"
                  value={item.title}
                  onValueChange={(value) => update(index, { title: value })}
                />
                <Textarea
                  label="Descripción"
                  minRows={2}
                  value={item.description}
                  onValueChange={(value) =>
                    update(index, { description: value })
                  }
                />
                <Select
                  label="Icono"
                  selectedKeys={[item.icon || "sparkles"]}
                  onSelectionChange={(keys) =>
                    update(index, { icon: String(Array.from(keys)[0]) })
                  }
                >
                  <SelectItem key="sparkles">Destello (Sparkles)</SelectItem>
                  <SelectItem key="shield">Seguridad / Garantía (Shield)</SelectItem>
                  <SelectItem key="clock">Puntualidad / Rapidez (Clock)</SelectItem>
                  <SelectItem key="heart">Pasión / Cuidado (Heart)</SelectItem>
                  <SelectItem key="award">Premio / Experiencia (Award)</SelectItem>
                  <SelectItem key="star">Excelencia (Star)</SelectItem>
                  <SelectItem key="zap">Energía / Eficiencia (Zap)</SelectItem>
                  <SelectItem key="check">Calidad verificada (Check)</SelectItem>
                </Select>
              </>
            )}
          </ListEditor>
        </>
      ) : null}

      {block.type === "stats" ? (
        <>
          <Input
            label="Título"
            value={asText(props.title)}
            onValueChange={(value) => set("title", value)}
          />
          <Textarea
            label="Descripción"
            value={asText(props.subtitle)}
            onValueChange={(value) => set("subtitle", value)}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Select
              label="Columnas"
              selectedKeys={[String(props.columns || 4)]}
              onSelectionChange={(keys) =>
                set("columns", Number(Array.from(keys)[0]))
              }
            >
              <SelectItem key="2">2 columnas</SelectItem>
              <SelectItem key="3">3 columnas</SelectItem>
              <SelectItem key="4">4 columnas</SelectItem>
            </Select>
            <AnimationSelect
              label="Animación"
              value={asText(props.animation)}
              onChange={(value) => set("animation", value)}
            />
          </div>
          <ListEditor<StatItem>
            title="Métricas"
            items={asArray<StatItem>(props.items)}
            emptyText="Añade números y datos de impacto."
            addLabel="Añadir estadística"
            createItem={() => ({
              id: `stat-${crypto.randomUUID()}`,
              value: "100+",
              label: "Clientes satisfechos",
            })}
            onChange={(items) => set("items", items)}
          >
            {(item, index, update) => (
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Valor o número"
                  value={item.value}
                  onValueChange={(value) => update(index, { value })}
                />
                <Input
                  label="Sufijo opcional (+, %, etc.)"
                  value={item.suffix || ""}
                  onValueChange={(value) => update(index, { suffix: value })}
                />
                <Input
                  className="sm:col-span-2"
                  label="Etiqueta / Descripción corta"
                  value={item.label}
                  onValueChange={(value) => update(index, { label: value })}
                />
              </div>
            )}
          </ListEditor>
        </>
      ) : null}

      {block.type === "call_to_action" ? (
        <>
          <Input
            label="Insignia / Badge"
            value={asText(props.badgeText)}
            onValueChange={(value) => set("badgeText", value)}
          />
          <Input
            label="Título llamativo"
            value={asText(props.title)}
            onValueChange={(value) => set("title", value)}
          />
          <Textarea
            label="Subtítulo / Mensaje convincente"
            value={asText(props.subtitle)}
            onValueChange={(value) => set("subtitle", value)}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Texto botón principal"
              value={asText(props.ctaText)}
              onValueChange={(value) => set("ctaText", value)}
            />
            <Input
              label="Enlace botón principal"
              value={asText(props.ctaHref)}
              onValueChange={(value) => set("ctaHref", value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Texto botón secundario"
              value={asText(props.secondaryCtaText)}
              onValueChange={(value) => set("secondaryCtaText", value)}
            />
            <Input
              label="Enlace botón secundario"
              value={asText(props.secondaryCtaHref)}
              onValueChange={(value) => set("secondaryCtaHref", value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Select
              label="Disposición de botones"
              selectedKeys={[asText(props.buttonLayout) || "row"]}
              onSelectionChange={(keys) =>
                set("buttonLayout", String(Array.from(keys)[0]))
              }
            >
              <SelectItem key="row">Lado a lado (Fila)</SelectItem>
              <SelectItem key="column">Uno sobre otro (Apilados)</SelectItem>
            </Select>
            <Select
              label="Alineación del contenido"
              selectedKeys={[asText(props.align) || "center"]}
              onSelectionChange={(keys) =>
                set("align", String(Array.from(keys)[0]))
              }
            >
              <SelectItem key="center">Centrado</SelectItem>
              <SelectItem key="left">Alineado a la izquierda</SelectItem>
            </Select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Select
              label="Estilo de fondo"
              selectedKeys={[asText(props.backgroundStyle) || "primary"]}
              onSelectionChange={(keys) =>
                set("backgroundStyle", String(Array.from(keys)[0]))
              }
            >
              <SelectItem key="primary">Color principal (Primary)</SelectItem>
              <SelectItem key="dark">Elegante oscuro (Dark)</SelectItem>
              <SelectItem key="soft">Sutil claro (Soft)</SelectItem>
            </Select>
            <AnimationSelect
              label="Animación"
              value={asText(props.animation)}
              onChange={(value) => set("animation", value)}
            />
          </div>
        </>
      ) : null}

      {uploadError ? (
        <p className="text-xs text-danger">{uploadError}</p>
      ) : null}
      {["services", "booking_calendar", "staff"].includes(block.type) ? (
        <p className="rounded-xl bg-[var(--app-canvas)] p-3 text-xs leading-5 text-[var(--app-muted)]">
          Los datos de esta sección se sincronizan con tu negocio. Aquí puedes
          ajustar su presentación.
        </p>
      ) : null}
    </div>
  );
}

function AutoContentFields({
  props,
  set,
  fields,
  labels,
}: {
  props: Record<string, unknown>;
  set: (key: string, value: unknown) => void;
  fields: string[];
  labels: string[];
}) {
  return (
    <>
      <Input
        label={labels[0]}
        value={asText(props[fields[0]])}
        onValueChange={(value) => set(fields[0], value)}
      />
      <Textarea
        label={labels[1]}
        value={asText(props[fields[1]])}
        onValueChange={(value) => set(fields[1], value)}
      />
    </>
  );
}

function ListEditor<T extends object>({
  title,
  items,
  emptyText,
  addLabel,
  createItem,
  onChange,
  children,
}: {
  title: string;
  items: T[];
  emptyText: string;
  addLabel: string;
  createItem: () => T;
  onChange: (items: T[]) => void;
  children: (
    item: T,
    index: number,
    update: (index: number, patch: Partial<T>) => void,
  ) => ReactNode;
}) {
  const update = (index: number, patch: Partial<T>) =>
    onChange(
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  const remove = (index: number) =>
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  const move = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return;
    const next = [...items];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">{title}</p>
        <Button
          size="sm"
          startContent={<Plus size={15} />}
          variant="flat"
          onPress={() => onChange([...items, createItem()])}
        >
          {addLabel}
        </Button>
      </div>
      {!items.length ? (
        <p className="rounded-xl border border-dashed border-[var(--app-line)] p-3 text-xs text-[var(--app-muted)]">
          {emptyText}
        </p>
      ) : null}
      {items.map((item, index) => (
        <Card
          key={index}
          className="border border-[var(--app-line)] shadow-none"
        >
          <CardBody className="gap-3 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--app-muted)]">
                Elemento {index + 1}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  isIconOnly
                  aria-label="Subir elemento"
                  isDisabled={index === 0}
                  size="sm"
                  variant="light"
                  onPress={() => move(index, -1)}
                >
                  <ArrowUp size={14} />
                </Button>
                <Button
                  isIconOnly
                  aria-label="Bajar elemento"
                  isDisabled={index === items.length - 1}
                  size="sm"
                  variant="light"
                  onPress={() => move(index, 1)}
                >
                  <ArrowDown size={14} />
                </Button>
                <Button
                  isIconOnly
                  aria-label="Eliminar elemento"
                  className="text-danger"
                  size="sm"
                  variant="light"
                  onPress={() => remove(index)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
            {children(item, index, update)}
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

function ImageField({
  value,
  uploading,
  onChange,
  onUpload,
}: {
  value: string;
  uploading: boolean;
  onChange: (value: string) => void;
  onUpload: (file: File) => Promise<void>;
}) {
  return (
    <div className="space-y-3">
      <Input label="URL de imagen" value={value} onValueChange={onChange} />
      <UploadInput uploading={uploading} onUpload={onUpload} />
    </div>
  );
}

function UploadInput({
  uploading,
  onUpload,
}: {
  uploading: boolean;
  onUpload: (file: File) => Promise<void>;
}) {
  return (
    <Input
      label="Subir imagen"
      type="file"
      accept="image/*"
      isDisabled={uploading}
      onChange={(event) => {
        const file = event.target.files?.[0];
        if (file) void onUpload(file);
      }}
    />
  );
}

function AnimationSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: LandingAnimation) => void;
}) {
  return (
    <Select
      label={label}
      selectedKeys={[value || "none"]}
      onSelectionChange={(keys) =>
        onChange(String(Array.from(keys)[0]) as LandingAnimation)
      }
    >
      {animationOptions.map(([key, optionLabel]) => (
        <SelectItem key={key}>{optionLabel}</SelectItem>
      ))}
    </Select>
  );
}

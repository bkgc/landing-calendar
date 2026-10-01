"use client";

import {
  BarChart3,
  ArrowDown,
  ArrowUp,
  ImagePlus,
  MousePointer2,
  Plus,
  Trash2,
  Type,
} from "lucide-react";
import type { ReactNode } from "react";

import {
  Button,
  Card,
  CardBody,
  Input,
  Select,
  SelectItem,
  Textarea,
} from "@/components/ui";
import type {
  LandingAnimation,
  LandingElement,
  LandingElementType,
} from "@/types/blocks";

const animations: Array<[LandingAnimation, string]> = [
  ["none", "Sin animación"],
  ["fade_in", "Aparecer"],
  ["fade_up", "Subir y aparecer"],
  ["slide_left", "Entrar desde la derecha"],
  ["slide_right", "Entrar desde la izquierda"],
  ["zoom_in", "Acercar"],
  ["float", "Flotar"],
];

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function elements(value: unknown) {
  return Array.isArray(value) ? (value as LandingElement[]) : [];
}

function newElement(type: LandingElementType): LandingElement {
  const id = `${type}-${crypto.randomUUID()}`;
  if (type === "image")
    return { id, type, url: "", alt: "", animation: "zoom_in" };
  if (type === "button")
    return {
      id,
      type,
      label: "Ver más",
      href: "#reservar",
      animation: "fade_up",
    };
  if (type === "stat")
    return {
      id,
      type,
      value: "10+",
      label: "Años de experiencia",
      animation: "fade_up",
    };
  return {
    id,
    type,
    title: "Nuevo contenido",
    body: "Escribe aquí tu mensaje.",
    animation: "fade_up",
  };
}

export function ContainerProperties({
  props,
  set,
}: {
  props: Record<string, unknown>;
  set: (key: string, value: unknown) => void;
}) {
  const items = elements(props.elements);
  const update = (index: number, patch: Partial<LandingElement>) =>
    set(
      "elements",
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  const move = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return;
    const next = [...items];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    set("elements", next);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Etiqueta superior"
          value={text(props.eyebrow)}
          onValueChange={(value) => set("eyebrow", value)}
        />
        <Input
          label="Título"
          value={text(props.title)}
          onValueChange={(value) => set("title", value)}
        />
      </div>
      <Textarea
        label="Descripción"
        value={text(props.subtitle)}
        onValueChange={(value) => set("subtitle", value)}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          label="Distribución"
          selectedKeys={[text(props.layout) || "split"]}
          onSelectionChange={(keys) =>
            set("layout", String(Array.from(keys)[0]))
          }
        >
          <SelectItem key="stack">Apilado</SelectItem>
          <SelectItem key="split">Dos columnas</SelectItem>
          <SelectItem key="grid">Cuadrícula</SelectItem>
        </Select>
        <Select
          label="Alineación"
          selectedKeys={[text(props.align) || "left"]}
          onSelectionChange={(keys) =>
            set("align", String(Array.from(keys)[0]))
          }
        >
          <SelectItem key="left">Izquierda</SelectItem>
          <SelectItem key="center">Centrada</SelectItem>
        </Select>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          label="Espaciado"
          selectedKeys={[text(props.padding) || "lg"]}
          onSelectionChange={(keys) =>
            set("padding", String(Array.from(keys)[0]))
          }
        >
          <SelectItem key="sm">Compacto</SelectItem>
          <SelectItem key="md">Medio</SelectItem>
          <SelectItem key="lg">Amplio</SelectItem>
        </Select>
        <Input
          label="Color de fondo"
          type="color"
          value={text(props.background) || "#f5f7f5"}
          onValueChange={(value) => set("background", value)}
        />
      </div>

      <div className="space-y-3 border-t border-[var(--app-line)] pt-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium">Elementos del contenedor</p>
            <p className="text-xs text-[var(--app-muted)]">
              Cada elemento puede tener su propia animación.
            </p>
          </div>
          <div className="flex gap-1">
            <AddButton
              label="Texto"
              icon={<Type size={14} />}
              onPress={() => set("elements", [...items, newElement("text")])}
            />
            <AddButton
              label="Imagen"
              icon={<ImagePlus size={14} />}
              onPress={() => set("elements", [...items, newElement("image")])}
            />
            <AddButton
              label="Botón"
              icon={<MousePointer2 size={14} />}
              onPress={() => set("elements", [...items, newElement("button")])}
            />
            <AddButton
              label="Dato"
              icon={<BarChart3 size={14} />}
              onPress={() => set("elements", [...items, newElement("stat")])}
            />
          </div>
        </div>
        {!items.length ? (
          <p className="rounded-xl border border-dashed border-[var(--app-line)] p-3 text-xs text-[var(--app-muted)]">
            Añade texto, imágenes, botones o datos destacados.
          </p>
        ) : null}
        {items.map((item, index) => (
          <Card
            key={item.id}
            className="border border-[var(--app-line)] shadow-none"
          >
            <CardBody className="gap-3 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--app-muted)]">
                  Elemento {index + 1}
                </span>
                <div className="flex gap-1">
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
                    onPress={() =>
                      set(
                        "elements",
                        items.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
              <Select
                label="Tipo"
                selectedKeys={[item.type]}
                onSelectionChange={(keys) =>
                  update(index, {
                    type: String(Array.from(keys)[0]) as LandingElementType,
                  })
                }
              >
                <SelectItem key="text">Texto</SelectItem>
                <SelectItem key="image">Imagen</SelectItem>
                <SelectItem key="button">Botón</SelectItem>
                <SelectItem key="stat">Dato destacado</SelectItem>
              </Select>
              <Select
                label="Animación independiente"
                selectedKeys={[item.animation || "none"]}
                onSelectionChange={(keys) =>
                  update(index, {
                    animation: String(Array.from(keys)[0]) as LandingAnimation,
                  })
                }
              >
                {animations.map(([key, label]) => (
                  <SelectItem key={key}>{label}</SelectItem>
                ))}
              </Select>
              {item.type === "text" ? (
                <>
                  <Input
                    label="Etiqueta"
                    value={item.eyebrow || ""}
                    onValueChange={(value) => update(index, { eyebrow: value })}
                  />
                  <Input
                    label="Título"
                    value={item.title || ""}
                    onValueChange={(value) => update(index, { title: value })}
                  />
                  <Textarea
                    label="Texto"
                    value={item.body || ""}
                    onValueChange={(value) => update(index, { body: value })}
                  />
                </>
              ) : null}
              {item.type === "image" ? (
                <>
                  <Input
                    label="URL de imagen"
                    value={item.url || ""}
                    onValueChange={(value) => update(index, { url: value })}
                  />
                  <Input
                    label="Texto alternativo"
                    value={item.alt || ""}
                    onValueChange={(value) => update(index, { alt: value })}
                  />
                </>
              ) : null}
              {item.type === "button" ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    label="Texto"
                    value={item.label || ""}
                    onValueChange={(value) => update(index, { label: value })}
                  />
                  <Input
                    label="Enlace"
                    value={item.href || ""}
                    onValueChange={(value) => update(index, { href: value })}
                  />
                </div>
              ) : null}
              {item.type === "stat" ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    label="Valor"
                    value={item.value || ""}
                    onValueChange={(value) => update(index, { value })}
                  />
                  <Input
                    label="Etiqueta"
                    value={item.label || ""}
                    onValueChange={(value) => update(index, { label: value })}
                  />
                </div>
              ) : null}
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AddButton({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: ReactNode;
  onPress: () => void;
}) {
  return (
    <Button
      className="min-w-0 px-2"
      size="sm"
      startContent={icon}
      variant="flat"
      onPress={onPress}
    >
      {label}
    </Button>
  );
}

"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

import {
  Button,
  Card,
  CardBody,
  Input,
  Select,
  SelectItem,
  Switch,
  Textarea,
} from "@/components/ui";
import type { LandingAnimation } from "@/types/blocks";

type CarouselImage = { url: string; alt: string };

const animations: Array<[LandingAnimation, string]> = [
  ["none", "Sin animación"],
  ["fade_in", "Aparecer"],
  ["fade_up", "Subir y aparecer"],
  ["zoom_in", "Acercar"],
  ["float", "Flotar"],
];

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function images(value: unknown) {
  return Array.isArray(value) ? (value as CarouselImage[]) : [];
}

export function CarouselProperties({
  props,
  set,
  uploading,
  onUpload,
}: {
  props: Record<string, unknown>;
  set: (key: string, value: unknown) => void;
  uploading: boolean;
  onUpload: (file: File) => Promise<void>;
}) {
  const items = images(props.images);
  const update = (index: number, patch: Partial<CarouselImage>) =>
    set(
      "images",
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  const move = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return;
    const next = [...items];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    set("images", next);
  };

  return (
    <div className="space-y-4">
      <Input
        label="Título"
        value={text(props.title)}
        onValueChange={(value) => set("title", value)}
      />
      <Textarea
        label="Descripción"
        value={text(props.subtitle)}
        onValueChange={(value) => set("subtitle", value)}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          label="Transición"
          selectedKeys={[text(props.transition) || "fade"]}
          onSelectionChange={(keys) =>
            set("transition", String(Array.from(keys)[0]))
          }
        >
          <SelectItem key="fade">Fundido</SelectItem>
          <SelectItem key="slide">Deslizamiento</SelectItem>
          <SelectItem key="ken_burns">Zoom suave</SelectItem>
        </Select>
        <Input
          label="Intervalo (ms)"
          type="number"
          min={1500}
          step={500}
          value={String(props.interval || 4500)}
          onValueChange={(value) =>
            set("interval", Math.max(1500, Number(value) || 4500))
          }
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[var(--app-canvas)] p-3">
        <Switch
          isSelected={props.autoplay !== false}
          onValueChange={(value) => set("autoplay", value)}
        >
          Reproducción automática
        </Switch>
        <Select
          className="max-w-52"
          label="Animación de entrada"
          selectedKeys={[text(props.animation) || "fade_up"]}
          onSelectionChange={(keys) =>
            set("animation", String(Array.from(keys)[0]) as LandingAnimation)
          }
        >
          {animations.map(([key, label]) => (
            <SelectItem key={key}>{label}</SelectItem>
          ))}
        </Select>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium">Imágenes del carrusel</p>
          <Button
            size="sm"
            startContent={<Plus size={15} />}
            variant="flat"
            onPress={() => set("images", [...items, { url: "", alt: "" }])}
          >
            Añadir imagen
          </Button>
        </div>
        {!items.length ? (
          <p className="rounded-xl border border-dashed border-[var(--app-line)] p-3 text-xs text-[var(--app-muted)]">
            Sube o añade imágenes para activar el carrusel.
          </p>
        ) : null}
        {items.map((item, index) => (
          <Card
            key={`${item.url}-${index}`}
            className="border border-[var(--app-line)] shadow-none"
          >
            <CardBody className="gap-3 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--app-muted)]">
                  Imagen {index + 1}
                </span>
                <div className="flex gap-1">
                  <Button
                    isIconOnly
                    aria-label="Subir imagen"
                    isDisabled={index === 0}
                    size="sm"
                    variant="light"
                    onPress={() => move(index, -1)}
                  >
                    <ArrowUp size={14} />
                  </Button>
                  <Button
                    isIconOnly
                    aria-label="Bajar imagen"
                    isDisabled={index === items.length - 1}
                    size="sm"
                    variant="light"
                    onPress={() => move(index, 1)}
                  >
                    <ArrowDown size={14} />
                  </Button>
                  <Button
                    isIconOnly
                    aria-label="Eliminar imagen"
                    className="text-danger"
                    size="sm"
                    variant="light"
                    onPress={() =>
                      set(
                        "images",
                        items.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
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
            </CardBody>
          </Card>
        ))}
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
      </div>
    </div>
  );
}

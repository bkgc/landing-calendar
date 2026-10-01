"use client";

import {
  BarChart3,
  Brush,
  CalendarDays,
  CircleHelp,
  Images,
  Layers3,
  LayoutTemplate,
  MapPin,
  Megaphone,
  MessageSquareText,
  PlaySquare,
  Plus,
  Quote,
  Sparkles,
  Users,
  Video,
  Wrench,
} from "lucide-react";

import { Button, Divider } from "@/components/ui";
import { BLOCK_LABELS, type BlockType } from "@/types/blocks";

const items: Array<[BlockType, typeof LayoutTemplate]> = [
  ["hero", LayoutTemplate],
  ["features", Sparkles],
  ["services", Wrench],
  ["booking_calendar", CalendarDays],
  ["stats", BarChart3],
  ["call_to_action", Megaphone],
  ["gallery", Images],
  ["image_carousel", Images],
  ["video_embed", Video],
  ["staff", Users],
  ["testimonials", Quote],
  ["text_image", Brush],
  ["faq", CircleHelp],
  ["map_contact", MapPin],
  ["container", Layers3],
  ["footer", PlaySquare],
];

export function BlockLibrary({ onAdd }: { onAdd: (type: BlockType) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold">Bloques</p>
        <p className="mt-1 text-xs leading-5 text-[var(--app-muted)]">
          Añade una sección y luego selecciónala para personalizarla.
        </p>
      </div>
      <Divider />
      <div className="grid gap-1">
        {items.map(([type, Icon]) => (
          <Button
            key={type}
            className="justify-start text-left"
            fullWidth
            startContent={<Icon size={16} />}
            variant="light"
            onPress={() => onAdd(type)}
          >
            <span className="flex-1">{BLOCK_LABELS[type]}</span>
            <Plus className="text-[var(--app-muted)]" size={15} />
          </Button>
        ))}
      </div>
      <div className="flex items-start gap-2 rounded-xl bg-[var(--app-canvas)] p-3 text-xs leading-5 text-[var(--app-muted)]">
        <MessageSquareText className="mt-0.5 shrink-0" size={15} />
        Arrastra el asa de cada bloque para cambiar su orden.
      </div>
    </div>
  );
}

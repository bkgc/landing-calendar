"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  BarChart3,
  Copy,
  GripVertical,
  Image,
  Images,
  LayoutTemplate,
  Megaphone,
  MessageSquareText,
  PanelTop,
  Pencil,
  Sparkles,
  Trash2,
  Users,
  Wrench,
} from "lucide-react";
import type { ComponentType } from "react";

import { BlockView } from "@/components/builder/BlockRenderer";
import { Button, Tooltip } from "@/components/ui";
import {
  BLOCK_LABELS,
  type BlockType,
  type LandingBlock,
} from "@/types/blocks";
import type { Business } from "@/types/business";
import type { Service } from "@/types/service";
import type { StaffMember } from "@/types/staff";

const blockIcons: Record<
  BlockType,
  ComponentType<{ size?: number; className?: string }>
> = {
  navbar: PanelTop,
  hero: LayoutTemplate,
  features: Sparkles,
  stats: BarChart3,
  services: Wrench,
  booking_calendar: MessageSquareText,
  call_to_action: Megaphone,
  gallery: Image,
  video_embed: Image,
  staff: Users,
  testimonials: MessageSquareText,
  text_image: LayoutTemplate,
  faq: MessageSquareText,
  map_contact: PanelTop,
  footer: PanelTop,
  container: LayoutTemplate,
  image_carousel: Images,
};

interface SortableBlockProps {
  block: LandingBlock;
  business: Business;
  services: Service[];
  staff: StaffMember[];
  selected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
}

export function SortableBlock({
  block,
  business,
  services,
  staff,
  selected,
  onSelect,
  onDuplicate,
  onRemove,
}: SortableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: block.id });
  const Icon = blockIcons[block.type];

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group relative transition-shadow ${selected ? "z-10 ring-2 ring-inset ring-[var(--app-primary)]" : "hover:ring-1 hover:ring-inset hover:ring-[#b8dcd6]"}`}
      {...attributes}
    >
      <div
        className={`absolute right-3 top-3 z-30 flex items-center gap-1 rounded-lg border border-[var(--app-line)] bg-white/95 p-1 shadow-sm backdrop-blur transition-opacity ${selected ? "opacity-100" : "pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100"}`}
      >
        <div className="flex min-w-0 items-center gap-2">
          <Tooltip content={`Mover ${BLOCK_LABELS[block.type]}`}>
            <Button
              isIconOnly
              aria-label={`Mover ${BLOCK_LABELS[block.type]}`}
              className="shrink-0 cursor-grab text-[var(--app-muted)] active:cursor-grabbing"
              size="sm"
              variant="light"
              {...listeners}
            >
              <GripVertical size={17} />
            </Button>
          </Tooltip>
          <div className="hidden min-w-0 items-center gap-2 pr-1 sm:flex">
            <Icon className="shrink-0 text-[var(--app-primary)]" size={16} />
            <span className="max-w-28 truncate text-xs font-semibold uppercase tracking-[0.12em] text-[var(--app-muted)]">
              {BLOCK_LABELS[block.type]}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip content="Editar bloque">
            <Button
              isIconOnly
              aria-label="Editar bloque"
              size="sm"
              variant="light"
              onPress={onSelect}
            >
              <Pencil size={15} />
            </Button>
          </Tooltip>
          {block.type !== "navbar" ? (
            <Tooltip content="Duplicar bloque">
              <Button
                isIconOnly
                aria-label="Duplicar bloque"
                size="sm"
                variant="light"
                onPress={onDuplicate}
              >
                <Copy size={15} />
              </Button>
            </Tooltip>
          ) : null}
          {block.type !== "navbar" ? (
            <Tooltip content="Eliminar bloque">
              <Button
                isIconOnly
                aria-label={`Eliminar ${BLOCK_LABELS[block.type]}`}
                className="text-danger"
                size="sm"
                variant="light"
                onPress={onRemove}
              >
                <Trash2 size={15} />
              </Button>
            </Tooltip>
          ) : null}
        </div>
      </div>
      <div
        className="cursor-pointer"
        role="button"
        tabIndex={0}
        onClick={(event) => {
          event.preventDefault();
          onSelect();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") onSelect();
        }}
      >
        <div className="pointer-events-none select-none">
          <BlockView
            block={block}
            business={business}
            services={services}
            staff={staff}
            preview
            editorMode
          />
        </div>
      </div>
    </div>
  );
}

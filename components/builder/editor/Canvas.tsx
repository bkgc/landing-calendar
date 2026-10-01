"use client";

import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { type CSSProperties, useState } from "react";
import { LayoutTemplate } from "lucide-react";

import { useLandingEditor } from "@/lib/hooks/useLandingEditor";
import { BLOCK_LABELS, getLandingFontStack } from "@/types/blocks";
import type { Business } from "@/types/business";
import type { Service } from "@/types/service";
import type { StaffMember } from "@/types/staff";

import { SortableBlock } from "./SortableBlock";

interface CanvasProps {
  business: Business;
  services: Service[];
  staff: StaffMember[];
}

export function Canvas({ business, services, staff }: CanvasProps) {
  const {
    config,
    selectedBlockId,
    select,
    reorder,
    removeBlock,
    duplicateBlock,
  } = useLandingEditor();
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const radius =
    config.theme.radius === "sm"
      ? "8px"
      : config.theme.radius === "md"
        ? "14px"
        : config.theme.radius === "full"
          ? "999px"
          : "22px";

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.over && event.active.id !== event.over.id) {
      reorder(String(event.active.id), String(event.over.id));
    }
  };

  const activeBlock = config.blocks.find((block) => block.id === activeId);

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={(event: DragStartEvent) =>
        setActiveId(String(event.active.id))
      }
      onDragCancel={() => setActiveId(null)}
      onDragEnd={(event) => {
        handleDragEnd(event);
        setActiveId(null);
      }}
      sensors={sensors}
    >
      <div className="pb-2">
        <div
          className="bg-[var(--landing-background)] text-[var(--landing-foreground)] [font-family:var(--landing-font)]"
          style={
            {
              "--landing-primary": config.theme.primary,
              "--landing-background": config.theme.background,
              "--landing-foreground": config.theme.foreground,
              "--landing-font": getLandingFontStack(config.theme.font),
              "--landing-radius": radius,
            } as CSSProperties
          }
        >
          <SortableContext
            items={config.blocks.map((block) => block.id)}
            strategy={verticalListSortingStrategy}
          >
            {config.blocks.map((block) => (
              <SortableBlock
                key={block.id}
                block={block}
                business={business}
                services={services}
                staff={staff}
                selected={selectedBlockId === block.id}
                onSelect={() => select(block.id)}
                onDuplicate={() => duplicateBlock(block.id)}
                onRemove={() => removeBlock(block.id)}
              />
            ))}
          </SortableContext>
        </div>
      </div>
      <DragOverlay>
        {activeBlock ? (
          <div className="flex items-center gap-2 rounded-xl border border-[var(--app-primary)] bg-white px-4 py-3 text-sm font-semibold shadow-xl">
            <LayoutTemplate className="text-[var(--app-primary)]" size={17} />
            {BLOCK_LABELS[activeBlock.type]}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

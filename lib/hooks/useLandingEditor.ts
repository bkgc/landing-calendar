"use client";

import { create } from "zustand";

import {
  DEFAULT_LANDING_CONFIG,
  createBlockProps,
  type BlockType,
  type LandingBlock,
  type LandingConfig,
  type LandingTheme,
} from "@/types/blocks";

type SaveState = "idle" | "saving" | "saved" | "error";

interface LandingEditorState {
  config: LandingConfig;
  selectedBlockId: string | null;
  loading: boolean;
  saving: boolean;
  dirty: boolean;
  saveState: SaveState;
  saveError: string | null;
  lastSavedAt: Date | null;
  past: LandingConfig[];
  future: LandingConfig[];
  load: () => Promise<void>;
  save: () => Promise<void>;
  undo: () => void;
  redo: () => void;
  select: (id: string | null) => void;
  updateTheme: (theme: Partial<LandingTheme>) => void;
  updateBlock: (id: string, props: Record<string, unknown>) => void;
  reorder: (activeId: string, overId: string) => void;
  addBlock: (type: BlockType) => void;
  duplicateBlock: (id: string) => void;
  removeBlock: (id: string) => void;
  applyTemplate: (config: LandingConfig) => void;
}

let saveTimer: ReturnType<typeof setTimeout> | undefined;

function scheduleSave(get: () => LandingEditorState) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => void get().save(), 800);
}

function normalizeConfig(config: LandingConfig): LandingConfig {
  return {
    theme: { ...DEFAULT_LANDING_CONFIG.theme, ...config.theme },
    blocks: config.blocks.map((block) => ({
      ...block,
      props: { ...createBlockProps(block.type), ...block.props },
    })),
  };
}

function copyConfig(config: LandingConfig): LandingConfig {
  return {
    theme: { ...config.theme },
    blocks: config.blocks.map((block) => ({
      ...block,
      props: { ...block.props },
    })),
  };
}

export const useLandingEditor = create<LandingEditorState>((set, get) => {
  const commit = (transform: (config: LandingConfig) => LandingConfig) => {
    let changed = false;
    set((state) => {
      const nextConfig = transform(state.config);
      if (nextConfig === state.config) return state;
      changed = true;
      return {
        ...state,
        config: nextConfig,
        past: [...state.past, copyConfig(state.config)].slice(-30),
        future: [],
        dirty: true,
        saveState: "idle" as const,
        saveError: null,
      };
    });
    if (changed) scheduleSave(get);
  };

  return {
    config: normalizeConfig(DEFAULT_LANDING_CONFIG),
    selectedBlockId: null,
    loading: true,
    saving: false,
    dirty: false,
    saveState: "idle",
    saveError: null,
    lastSavedAt: null,
    past: [],
    future: [],
    load: async () => {
      try {
        const response = await fetch("/api/business/landing");
        const result = await response.json();
        if (result.success) {
          const config = normalizeConfig(result.data as LandingConfig);
          set({
            config,
            loading: false,
            dirty: false,
            saveState: "saved",
            saveError: null,
            past: [],
            future: [],
          });
        } else {
          set({
            loading: false,
            saveState: "error",
            saveError: "No se pudo cargar la landing.",
          });
        }
      } catch {
        set({
          loading: false,
          saveState: "error",
          saveError: "No se pudo cargar la landing.",
        });
      }
    },
    save: async () => {
      if (saveTimer) clearTimeout(saveTimer);
      if (get().saving) {
        scheduleSave(get);
        return;
      }
      const configToSave = copyConfig(get().config);
      set({ saving: true, saveState: "saving", saveError: null });
      try {
        const response = await fetch("/api/business/landing", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(configToSave),
        });
        const result = (await response.json()) as {
          error?: string;
          success?: boolean;
        };
        if (!response.ok || !result.success) {
          throw new Error(result.error || "No se pudo guardar la página.");
        }
        const hasPendingChanges =
          JSON.stringify(get().config) !== JSON.stringify(configToSave);
        set({
          saving: false,
          dirty: hasPendingChanges,
          saveState: hasPendingChanges ? "idle" : "saved",
          saveError: null,
          lastSavedAt: new Date(),
        });
        if (hasPendingChanges) scheduleSave(get);
      } catch (error) {
        const errorMsg =
          error instanceof Error
            ? error.message
            : "No se pudieron guardar los cambios.";
        set({
          saving: false,
          saveState: "error",
          saveError: errorMsg,
        });
      }
    },
    undo: () => {
      const state = get();
      const previous = state.past[state.past.length - 1];
      if (!previous) return;
      set({
        config: copyConfig(previous),
        past: state.past.slice(0, -1),
        future: [copyConfig(state.config), ...state.future].slice(0, 30),
        dirty: true,
        saveState: "idle",
        saveError: null,
      });
      scheduleSave(get);
    },
    redo: () => {
      const state = get();
      const next = state.future[0];
      if (!next) return;
      set({
        config: copyConfig(next),
        past: [...state.past, copyConfig(state.config)].slice(-30),
        future: state.future.slice(1),
        dirty: true,
        saveState: "idle",
        saveError: null,
      });
      scheduleSave(get);
    },
    select: (id) => set({ selectedBlockId: id }),
    updateTheme: (theme) =>
      commit((config) => ({
        ...config,
        theme: { ...config.theme, ...theme },
      })),
    updateBlock: (id, props) =>
      commit((config) => ({
        ...config,
        blocks: config.blocks.map((block) =>
          block.id === id
            ? { ...block, props: { ...block.props, ...props } }
            : block,
        ),
      })),
    reorder: (activeId, overId) =>
      commit((config) => {
        const activeIndex = config.blocks.findIndex(
          (block) => block.id === activeId,
        );
        const overIndex = config.blocks.findIndex(
          (block) => block.id === overId,
        );
        if (activeIndex < 0 || overIndex < 0 || activeIndex === overIndex)
          return config;
        const blocks = [...config.blocks];
        const [active] = blocks.splice(activeIndex, 1);
        blocks.splice(overIndex, 0, active);
        return { ...config, blocks };
      }),
    addBlock: (type) => {
      const block: LandingBlock = {
        id: `${type}-${crypto.randomUUID()}`,
        type,
        props: createBlockProps(type),
      };
      commit((config) => ({
        ...config,
        blocks: [...config.blocks, block],
      }));
      set({ selectedBlockId: block.id });
    },
    duplicateBlock: (id) => {
      let duplicatedId: string | null = null;
      commit((config) => {
        const index = config.blocks.findIndex((block) => block.id === id);
        if (index < 0) return config;
        const source = config.blocks[index];
        const copy: LandingBlock = {
          ...source,
          id: `${source.type}-${crypto.randomUUID()}`,
          props: { ...source.props },
        };
        duplicatedId = copy.id;
        const blocks = [...config.blocks];
        blocks.splice(index + 1, 0, copy);
        return { ...config, blocks };
      });
      if (duplicatedId) set({ selectedBlockId: duplicatedId });
    },
    removeBlock: (id) => {
      commit((config) => ({
        ...config,
        blocks: config.blocks.filter(
          (block) => block.id !== id || block.type === "navbar",
        ),
      }));
      if (get().selectedBlockId === id) set({ selectedBlockId: null });
    },
    applyTemplate: (newConfig) => {
      commit(() => normalizeConfig(newConfig));
      set({ selectedBlockId: null });
    },
  };
});

"use client";

import { Chip, Input, Select, SelectItem, Slider } from "@heroui/react";

import { useLandingEditor } from "@/lib/hooks/useLandingEditor";
import { getLandingFontStack } from "@/types/blocks";

const fonts = [
  "Inter",
  "DM Sans",
  "Manrope",
  "Outfit",
  "Poppins",
  "Montserrat",
  "Plus Jakarta Sans",
  "Space Grotesk",
  "Playfair Display",
  "Lora",
  "Cinzel",
  "Caveat",
  "Syne",
  "Roboto",
];
const radiusValues = ["sm", "md", "lg", "full"] as const;

export function ThemePanel() {
  const { config, updateTheme } = useLandingEditor();
  const radiusIndex = Math.max(0, radiusValues.indexOf(config.theme.radius));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Tema global</h2>
          <p className="mt-1 text-xs text-[var(--app-muted)]">
            Define la identidad visual de tu página pública.
          </p>
        </div>
        <Chip color="success" size="sm" variant="flat">
          Activo
        </Chip>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Input
          label="Principal"
          type="color"
          value={config.theme.primary}
          onValueChange={(value) => updateTheme({ primary: value })}
        />
        <Input
          label="Fondo"
          type="color"
          value={config.theme.background}
          onValueChange={(value) => updateTheme({ background: value })}
        />
        <Input
          label="Texto"
          type="color"
          value={config.theme.foreground}
          onValueChange={(value) => updateTheme({ foreground: value })}
        />
      </div>
      <Select
        label="Tipografía"
        selectedKeys={[config.theme.font]}
        onSelectionChange={(keys) =>
          updateTheme({ font: String(Array.from(keys)[0]) })
        }
      >
        {fonts.map((font) => (
          <SelectItem key={font} textValue={font}>
            <span style={{ fontFamily: getLandingFontStack(font) }}>
              {font}
            </span>
          </SelectItem>
        ))}
      </Select>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Radio de componentes</span>
          <span className="text-[var(--app-muted)]">
            {radiusValues[radiusIndex]}
          </span>
        </div>
        <Slider
          aria-label="Radio de componentes"
          maxValue={3}
          minValue={0}
          step={1}
          value={radiusIndex}
          onChange={(value) => {
            const next = Array.isArray(value) ? value[0] : value;
            updateTheme({ radius: radiusValues[Number(next)] || "lg" });
          }}
        />
      </div>
    </div>
  );
}

export type PaletteId = "violet" | "ocean" | "sunset" | "night" | "forest" | "black";

export type Palette = {
  id: PaletteId;
  name: string;
  hint: string;
  dark: boolean;
  swatches: [string, string, string];
};

export const PALETTES: Palette[] = [
  {
    id: "violet",
    name: "Lila",
    hint: "Claro, el violeta de siempre",
    dark: false,
    swatches: ["#f7f4ff", "#7c3aed", "#e9d5ff"],
  },
  {
    id: "ocean",
    name: "Océano",
    hint: "Claro, azules y agua",
    dark: false,
    swatches: ["#f0f9ff", "#0284c7", "#67e8f9"],
  },
  {
    id: "sunset",
    name: "Atardecer",
    hint: "Claro, coral y durazno",
    dark: false,
    swatches: ["#fff7ed", "#ea580c", "#fda4af"],
  },
  {
    id: "night",
    name: "Noche",
    hint: "Oscuro violeta",
    dark: true,
    swatches: ["#1c1630", "#c4b5fd", "#5b21b6"],
  },
  {
    id: "forest",
    name: "Bosque",
    hint: "Oscuro verde musgo",
    dark: true,
    swatches: ["#0f1a14", "#4ade80", "#14532d"],
  },
  {
    id: "black",
    name: "Negro",
    hint: "Todo negro, OLED",
    dark: true,
    swatches: ["#000000", "#fafafa", "#171717"],
  },
];

export const DEFAULT_PALETTE: PaletteId = "violet";

export function paletteById(id: string | undefined): Palette {
  return PALETTES.find((p) => p.id === id) ?? PALETTES[0];
}

export function applyPalette(id: PaletteId) {
  const p = paletteById(id);
  const root = document.documentElement;
  root.dataset.palette = p.id;
  root.classList.toggle("dark", p.dark);
}

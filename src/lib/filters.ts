export interface FilterDef {
  name: string;
  label: string;
  css: string;
  /** Canvas filter string applied when capturing */
  canvasFilter: string;
  /** Optional overlay color (rgba) */
  overlay?: string;
}

export const FILTERS: FilterDef[] = [
  {
    name: "classic",
    label: "Klassisk",
    css: "sepia(0.4) saturate(1.3) contrast(1.1) brightness(1.05)",
    canvasFilter: "sepia(0.4) saturate(1.3) contrast(1.1) brightness(1.05)",
    overlay: "rgba(255, 235, 180, 0.08)",
  },
  {
    name: "warm",
    label: "Varm",
    css: "sepia(0.25) saturate(1.5) brightness(1.1) hue-rotate(-10deg)",
    canvasFilter: "sepia(0.25) saturate(1.5) brightness(1.1) hue-rotate(-10deg)",
    overlay: "rgba(255, 180, 100, 0.1)",
  },
  {
    name: "cool",
    label: "Kjølig",
    css: "saturate(0.9) brightness(1.05) hue-rotate(15deg) contrast(1.05)",
    canvasFilter: "saturate(0.9) brightness(1.05) hue-rotate(15deg) contrast(1.05)",
    overlay: "rgba(150, 180, 255, 0.08)",
  },
  {
    name: "bw",
    label: "S/H",
    css: "grayscale(1) contrast(1.2) brightness(1.05)",
    canvasFilter: "grayscale(1) contrast(1.2) brightness(1.05)",
  },
  {
    name: "vintage",
    label: "Vintage",
    css: "sepia(0.6) contrast(1.1) brightness(0.95) saturate(0.8)",
    canvasFilter: "sepia(0.6) contrast(1.1) brightness(0.95) saturate(0.8)",
    overlay: "rgba(200, 150, 100, 0.12)",
  },
  {
    name: "none",
    label: "Ingen",
    css: "none",
    canvasFilter: "none",
  },
];

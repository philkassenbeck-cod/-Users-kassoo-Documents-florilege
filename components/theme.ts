// components/theme.ts
// Charte Optimup — palette jewel-ink + laiton (atelier de parfumeur).
// Constantes pour styles inline ; les mêmes valeurs existent en CSS vars
// dans app/globals.css (--ink, --brass, …) pour les classes partagées.

export const C = {
  ink: "#1A1A28",
  ink2: "#232338",
  panel: "#20202F",
  brass: "#C9A45C",
  brassSoft: "#E3C892",
  blush: "#E4A98F",
  violet: "#B49BC8",
  porcelain: "#F3ECE1",
  muted: "#9A93A8",
  line: "rgba(243,236,225,0.14)",
} as const;

export const DISPLAY = 'Georgia, "Iowan Old Style", "Times New Roman", serif';
export const SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

// Quadrants Johari (couleurs) — partagé par le débrief 360 (étape 3).
export const QUAD = {
  shared_signature: { color: C.brass },
  positive_blind_spot: { color: C.blush },
  secret_garden: { color: C.violet },
  dormant: { color: C.muted },
} as const;

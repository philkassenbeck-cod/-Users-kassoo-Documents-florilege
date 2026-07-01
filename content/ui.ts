// content/ui.ts — libellés d'INTERFACE bilingues (hors data du noyau).

import type { Lang } from "@core";

type L = Record<Lang, string>;
type Dict = Record<string, L>;

export const UI: Dict = {
  brand: { fr: "OPTIMUP · FLORILÈGE", en: "OPTIMUP · FLORILÈGE" },

  // Landing / page de vente (version courte, étape 2)
  landingEyebrow: { fr: "OPTIMUP · DIAGNOSTIC DE FORCES", en: "OPTIMUP · STRENGTHS DIAGNOSTIC" },
  landingTitle: { fr: "Votre florilège", en: "Your florilège" },
  landingSubtitle: {
    fr: "Trois forces dominantes. Une signature.",
    en: "Three dominant strengths. One signature.",
  },
  landingBody: {
    fr: "Un diagnostic de forces fondé sur des construits validés (Big Five). Huit minutes pour révéler, parmi vos huit forces, les trois qui vous signent.",
    en: "A strengths diagnostic grounded in validated constructs (Big Five). Eight minutes to reveal, among your eight strengths, the three that sign you.",
  },
  landingCta: { fr: "Commencer le diagnostic", en: "Start the diagnostic" },
  landingMinutes: { fr: "≈ 8 minutes · FR / EN", en: "≈ 8 minutes · FR / EN" },

  // Passation
  passationEyebrow: { fr: "LE DIAGNOSTIC", en: "THE DIAGNOSTIC" },
  progressOf: { fr: "sur", en: "of" },
  back: { fr: "Précédent", en: "Back" },
  passationHint: {
    fr: "Répondez spontanément — il n'y a pas de bonne réponse.",
    en: "Answer spontaneously — there is no right answer.",
  },
  computing: { fr: "Composition de votre florilège…", en: "Composing your florilège…" },

  // Débrief self
  reveal: { fr: "Révéler mon florilège", en: "Reveal my florilège" },
  revealHint: {
    fr: "8 minutes suffisent. Voici ce qu'elles ont dit de vous.",
    en: "Eight minutes was enough. Here's what they said about you.",
  },
  notes: {
    fr: "Note de tête|Note de cœur|Note de fond",
    en: "Top note|Heart note|Base note",
  },
  flipHint: { fr: "toucher pour l'origine", en: "tap for its origin" },
  backHint: { fr: "revenir à la force", en: "back to the strength" },
  originLabel: { fr: "D'où vient cette force ?", en: "Where does this strength come from?" },
  nuggetLabel: { fr: "En équipe", en: "With your team" },
  signatureLabel: { fr: "En une phrase", en: "In one line" },
  constTitle: { fr: "Vos huit forces", en: "Your eight strengths" },

  // Résultat sans données
  noResultTitle: { fr: "Aucun florilège pour l'instant", en: "No florilège yet" },
  noResultBody: {
    fr: "Passez le diagnostic pour révéler vos trois forces dominantes.",
    en: "Take the diagnostic to reveal your three dominant strengths.",
  },
};

/** Résout un libellé d'interface. */
export function tr(key: keyof typeof UI | string, lang: Lang): string {
  return UI[key]?.[lang] ?? String(key);
}

// core/items.ts
// Ordonnancement des items pour la passation — pur et déterministe
// (aucun random : SSR-safe et testable). L'app se contente de rendre.

import type { FlorilegeData, FlorilegeItem, Lang } from "./types";

export interface ServedItem {
  item: FlorilegeItem;
  forceId: string;
  family: string;
  /** position 0-based dans la séquence servie */
  index: number;
}

/**
 * Ordre des forces conçu pour entrelacer les familles (jamais deux items de la
 * même famille servis d'affilée). La séquence de familles obtenue par tour est
 * Accomplir · Rayonner · Relier · Imaginer, répétée.
 */
const INTERLEAVE_ORDER = [
  "accomplir_industrie",
  "rayonner_assertivite",
  "relier_compassion",
  "imaginer_intellect",
  "accomplir_ordre",
  "rayonner_enthousiasme",
  "relier_politesse",
  "imaginer_ouverture",
];

function orderedForces(data: FlorilegeData) {
  const byId = new Map(data.forces.map((f) => [f.id, f]));
  const ordered = INTERLEAVE_ORDER.map((id) => byId.get(id)).filter(Boolean) as typeof data.forces;
  // Filet de sécurité : si un id manque/diverge, on complète avec le reste.
  for (const f of data.forces) if (!INTERLEAVE_ORDER.includes(f.id)) ordered.push(f);
  return ordered;
}

/**
 * Les 48 items du test self, familles entrelacées.
 * Round-robin : pour chaque passe p, un item de chaque force dans l'ordre entrelacé.
 */
export function interleavedSelfItems(data: FlorilegeData): ServedItem[] {
  const forces = orderedForces(data);
  const maxItems = Math.max(...forces.map((f) => f.items.length));
  const served: ServedItem[] = [];
  for (let p = 0; p < maxItems; p++) {
    for (const f of forces) {
      const item = f.items[p];
      if (item) served.push({ item, forceId: f.id, family: f.family, index: served.length });
    }
  }
  return served;
}

/** Les 16 items observateur (in360), avec le gabarit `observer` prêt à interpoler. */
export interface ObserverItem {
  id: string;
  forceId: string;
  family: string;
  reverse: boolean;
  template: Record<Lang, string>;
}

export function observerItems(data: FlorilegeData): ObserverItem[] {
  const out: ObserverItem[] = [];
  for (const f of orderedForces(data)) {
    for (const it of f.items) {
      if (it.in360 && it.observer) {
        out.push({
          id: it.id,
          forceId: f.id,
          family: f.family,
          reverse: it.reverse,
          template: it.observer,
        });
      }
    }
  }
  return out;
}

/** Interpole le prénom du sujet dans un gabarit observateur. */
export function observerText(template: Record<Lang, string>, name: string, lang: Lang): string {
  return template[lang].replace(/\{name\}/g, name);
}

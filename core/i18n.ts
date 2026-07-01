// core/i18n.ts
// Aides d'affichage bilingues — pures (pas de React, pas de contexte).
// Le choix de la langue active est géré par l'app ; ici on se contente de
// résoudre des libellés à partir des données du noyau.

import type { FlorilegeData, FlorilegeForce, Family, Lang } from "./types";

export const LANGS: Lang[] = ["fr", "en"];

/** Libellé d'une force, avec gestion du libellé candidat alternatif. */
export function forceLabel(force: FlorilegeForce, lang: Lang, useAlt = false): string {
  if (useAlt) {
    const alt = lang === "fr" ? force.label.alt_fr : force.label.alt_en;
    if (alt) return alt;
  }
  return force.label[lang];
}

/** Libellé d'une famille (posture-verbe) par id. */
export function familyLabel(data: FlorilegeData, familyId: string, lang: Lang): string {
  const fam = data.families.find((f) => f.id === familyId);
  return fam ? fam.label[lang] : familyId;
}

export function findForce(data: FlorilegeData, forceId: string): FlorilegeForce | undefined {
  return data.forces.find((f) => f.id === forceId);
}

export function findFamily(data: FlorilegeData, familyId: string): Family | undefined {
  return data.families.find((f) => f.id === familyId);
}

/** Libellés de l'échelle de Likert dans la langue active. */
export function scaleLabels(data: FlorilegeData, lang: Lang): string[] {
  return data.meta.scale.labels[lang];
}

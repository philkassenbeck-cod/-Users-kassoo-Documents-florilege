// core/scoring/self.ts
// Moteur de scoring du Florilège (test self) — fonctions pures.
// Ex-`florilege-scoring.ts`. Les types vivent désormais dans ../types.

import type {
  FlorilegeData,
  FlorilegeForce,
  ForceScore,
  FlorilegeResult,
  Responses,
} from "../types";

const SCALE_MIN = 1;
const SCALE_MAX = 5;

/** Recode un item inversé : 6 - x sur une échelle 1..5 (généralisé). */
export function recode(value: number, reverse: boolean): number {
  return reverse ? SCALE_MIN + SCALE_MAX - value : value;
}

/** Valide qu'une réponse est un nombre dans l'échelle. */
function isValid(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v) && v >= SCALE_MIN && v <= SCALE_MAX;
}

/** Score d'une force = moyenne des items valides (inversés recodés). */
export function scoreForce(force: FlorilegeForce, responses: Responses): ForceScore {
  let sum = 0;
  let answered = 0;
  for (const item of force.items) {
    const raw = responses[item.id];
    if (isValid(raw)) {
      sum += recode(raw, item.reverse);
      answered += 1;
    }
  }
  return {
    forceId: force.id,
    family: force.family,
    score: answered > 0 ? sum / answered : 0,
    answered,
    expected: force.items.length,
  };
}

/**
 * Calcule le résultat complet.
 * - trie les forces par score décroissant
 * - extrait le florilège (top N, défaut = meta.scoring.florilege_size ou 3)
 * En cas d'égalité, l'ordre initial des forces départage (tri stable).
 */
export function computeFlorilege(
  data: FlorilegeData,
  responses: Responses,
  florilegeSize?: number
): FlorilegeResult {
  const size = florilegeSize ?? data.meta.scoring.florilege_size ?? 3;

  const scores = data.forces
    .map((f) => scoreForce(f, responses))
    .sort((a, b) => b.score - a.score);

  const complete = scores.every((s) => s.answered === s.expected);

  return {
    scores,
    florilege: scores.slice(0, size),
    complete,
  };
}

// ---------- Qualité / validation continue (optionnel) ----------
// matrix : number[][] -> lignes = répondants, colonnes = items d'UNE force,
//          valeurs déjà recodées. À brancher sur un batch de N passations
//          complètes, jamais sur une passation isolée.
export function cronbachAlpha(matrix: number[][]): number {
  const nResp = matrix.length;
  if (nResp < 2) return NaN;
  const k = matrix[0].length;
  if (k < 2) return NaN;

  const variance = (xs: number[]): number => {
    const m = xs.reduce((a, b) => a + b, 0) / xs.length;
    return xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1);
  };

  let sumItemVar = 0;
  for (let c = 0; c < k; c++) {
    sumItemVar += variance(matrix.map((row) => row[c]));
  }
  const totals = matrix.map((row) => row.reduce((a, b) => a + b, 0));
  const totalVar = variance(totals);
  if (totalVar === 0) return NaN;

  return (k / (k - 1)) * (1 - sumItemVar / totalVar);
}

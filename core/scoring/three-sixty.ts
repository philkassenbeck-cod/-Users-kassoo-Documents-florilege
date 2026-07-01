// core/scoring/three-sixty.ts
// Extension 360 du Florilège — regard des autres, écarts soi/autrui, Johari.
// Ex-`florilege-360-scoring.ts`. Fonctions pures. Se compose avec ./self.

import type {
  FlorilegeData,
  FlorilegeForce,
  Lang,
  ObserverResponse,
  ForceGap,
  CircleView,
} from "../types";

const SCALE_MIN = 1;
const SCALE_MAX = 5;
const recode = (v: number, rev: boolean) => (rev ? SCALE_MIN + SCALE_MAX - v : v);
const isValid = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v) && v >= SCALE_MIN && v <= SCALE_MAX;

/** Score d'un répondant sur une force (items 360 uniquement). */
function respondentForceScore(force: FlorilegeForce, r: ObserverResponse): number | null {
  const items = force.items.filter((i) => i.in360);
  let sum = 0;
  let n = 0;
  for (const it of items) {
    const raw = r.responses[it.id];
    if (isValid(raw)) {
      sum += recode(raw, it.reverse);
      n += 1;
    }
  }
  return n > 0 ? sum / n : null;
}

/**
 * Compare l'auto-évaluation (selfScores: {forceId: score}) au regard des autres.
 * @param filterCircle si fourni, n'agrège que ce cercle (respecte le seuil d'anonymat).
 */
export function computeGaps(
  data: FlorilegeData,
  selfScores: Record<string, number>,
  observers: ObserverResponse[],
  filterCircle?: string
): ForceGap[] {
  const { high_cut } = data.three_sixty.johari;
  const minN = data.three_sixty.anonymity.min_respondents_per_circle;
  const pool = filterCircle ? observers.filter((o) => o.circle === filterCircle) : observers;

  // Seuil d'anonymat : trop peu de répondants → on n'affiche pas les moyennes.
  const belowThreshold = pool.length < minN;

  return data.forces.map((f) => {
    const self = selfScores[f.id] ?? 0;
    const perResp = pool
      .map((r) => respondentForceScore(f, r))
      .filter((x): x is number => x !== null);

    const nR = perResp.length;
    const other = !belowThreshold && nR > 0 ? perResp.reduce((a, b) => a + b, 0) / nR : null;
    const nHigh = perResp.filter((x) => x >= high_cut).length;
    const delta = other !== null ? other - self : null;

    return {
      forceId: f.id,
      family: f.family,
      self,
      other,
      delta,
      nRespondents: nR,
      nHigh,
      quadrant: other !== null ? classifyJohari(self, other, high_cut) : null,
    };
  });
}

/** Fenêtre de Johari : quadrant selon (soi haut/bas, autres haut/bas). */
export function classifyJohari(self: number, other: number, highCut: number): string {
  const selfHigh = self >= highCut;
  const otherHigh = other >= highCut;
  if (selfHigh && otherHigh) return "shared_signature";
  if (!selfHigh && otherHigh) return "positive_blind_spot";
  if (selfHigh && !otherHigh) return "secret_garden";
  return "dormant";
}

/** Les pépites (angles morts positifs), triées par écart décroissant. */
export function extractPepites(data: FlorilegeData, gaps: ForceGap[]): ForceGap[] {
  const sig = data.three_sixty.johari.gap_significant;
  return gaps
    .filter((g) => g.quadrant === "positive_blind_spot" && g.delta !== null && g.delta >= sig)
    .sort((a, b) => (b.delta ?? 0) - (a.delta ?? 0));
}

/** Formulation honnête : compte plutôt que pourcentage sous le seuil. */
export function highPhrase(
  data: FlorilegeData,
  gap: ForceGap,
  forceLabel: string,
  lang: Lang,
  circleLabel?: string
): string {
  const pt = data.three_sixty.reporting.count_vs_percent.percent_threshold;
  const who = circleLabel ?? (lang === "fr" ? "personnes" : "people");
  if (gap.nRespondents >= pt) {
    const pct = Math.round((gap.nHigh / gap.nRespondents) * 100);
    return lang === "fr"
      ? `${pct} % de ${who} vous voient ${forceLabel.toLowerCase()}.`
      : `${pct}% of ${who} see you as ${forceLabel.toLowerCase()}.`;
  }
  return lang === "fr"
    ? `${gap.nHigh} ${who} sur ${gap.nRespondents} vous voient ${forceLabel.toLowerCase()}.`
    : `${gap.nHigh} of ${gap.nRespondents} ${who} see you as ${forceLabel.toLowerCase()}.`;
}

/** Ligne de coaching par quadrant Johari. */
export function johariLine(data: FlorilegeData, gap: ForceGap, forceLabel: string, lang: Lang): string {
  if (!gap.quadrant) return "";
  const q = data.three_sixty.johari.quadrants[gap.quadrant];
  return q.line[lang].replace("{force}", forceLabel);
}

/** Agrégat par cercle (respecte le seuil d'anonymat). */
export function byCircle(
  data: FlorilegeData,
  selfScores: Record<string, number>,
  observers: ObserverResponse[]
): CircleView[] {
  const minN = data.three_sixty.anonymity.min_respondents_per_circle;
  return data.three_sixty.circles.map((c) => {
    const n = observers.filter((o) => o.circle === c.id).length;
    return {
      circleId: c.id,
      visible: n >= minN,
      n,
      gaps: n >= minN ? computeGaps(data, selfScores, observers, c.id) : [],
    };
  });
}

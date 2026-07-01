// core/__tests__/scoring.test.ts
// Vérifie le calcul du florilège (self) et d'un écart 360 (pépite).

import { describe, it, expect } from "vitest";
import {
  florilegeData as data,
  computeFlorilege,
  computeGaps,
  extractPepites,
  interleavedSelfItems,
  observerItems,
} from "../index";
import type { Responses, ObserverResponse } from "../types";

/**
 * Fabrique des réponses self : `high` → score 5 pour la force,
 * sinon score neutre 3. (Recodage géré : item inversé → on répond l'opposé.)
 */
function buildSelfResponses(highForceIds: string[]): Responses {
  const r: Responses = {};
  for (const force of data.forces) {
    const high = highForceIds.includes(force.id);
    for (const item of force.items) {
      // non-inversé : 5 pour high, 3 sinon. inversé : miroir (1 pour high, 3 sinon).
      if (high) r[item.id] = item.reverse ? 1 : 5;
      else r[item.id] = 3;
    }
  }
  return r;
}

describe("florilège self", () => {
  const TOP3 = ["imaginer_intellect", "rayonner_assertivite", "relier_compassion"];

  it("sert 48 items self, familles entrelacées", () => {
    const served = interleavedSelfItems(data);
    expect(served).toHaveLength(48);
    // Jamais deux familles identiques d'affilée.
    for (let i = 1; i < served.length; i++) {
      expect(served[i].family).not.toBe(served[i - 1].family);
    }
  });

  it("extrait le top 3 comme florilège, et marque la passation complète", () => {
    const res = computeFlorilege(data, buildSelfResponses(TOP3));
    expect(res.complete).toBe(true);
    expect(res.florilege).toHaveLength(3);
    expect(new Set(res.florilege.map((f) => f.forceId))).toEqual(new Set(TOP3));
    for (const f of res.florilege) expect(f.score).toBeCloseTo(5, 5);
  });

  it("marque la passation incomplète si un item manque", () => {
    const partial = buildSelfResponses(TOP3);
    delete partial["imaginer_intellect_1"];
    expect(computeFlorilege(data, partial).complete).toBe(false);
  });
});

describe("écart 360 — pépite (angle mort positif)", () => {
  it("détecte une force sous-estimée par soi et vue haute par les autres", () => {
    const AUDACE = "rayonner_assertivite";
    const audaceItemIds = new Set(
      observerItems(data).filter((o) => o.forceId === AUDACE).map((o) => o.id)
    );

    // 5 pairs : Audace au max (5), neutre (3) ailleurs → au-dessus du seuil d'anonymat.
    const observers: ObserverResponse[] = Array.from({ length: 5 }, () => {
      const responses: Record<string, number> = {};
      for (const o of observerItems(data)) responses[o.id] = audaceItemIds.has(o.id) ? 5 : 3;
      return { circle: "peers", responses };
    });

    // L'intéressé se sous-évalue sur l'Audace.
    const selfScores = { [AUDACE]: 2.0 };

    const gaps = computeGaps(data, selfScores, observers);
    const audace = gaps.find((g) => g.forceId === AUDACE)!;

    expect(audace.nRespondents).toBe(5);
    expect(audace.nHigh).toBe(5);
    expect(audace.other).toBeCloseTo(5, 5);
    expect(audace.delta).toBeCloseTo(3, 5);
    expect(audace.quadrant).toBe("positive_blind_spot");

    const pepites = extractPepites(data, gaps);
    expect(pepites.map((p) => p.forceId)).toContain(AUDACE);
  });

  it("masque un cercle sous le seuil d'anonymat (< 3 répondants)", () => {
    const observers: ObserverResponse[] = [
      { circle: "manager", responses: { rayonner_assertivite_1: 5 } },
      { circle: "manager", responses: { rayonner_assertivite_1: 5 } },
    ];
    const gaps = computeGaps(data, {}, observers, "manager");
    for (const g of gaps) expect(g.other).toBeNull();
  });

  it("bypassThreshold : un manager seul consentant est affiché (exception nominative)", () => {
    const observers: ObserverResponse[] = [
      { circle: "manager", responses: { rayonner_assertivite_1: 5, rayonner_assertivite_2: 5 } },
    ];
    // Par défaut : masqué (seuil d'anonymat).
    const hidden = computeGaps(data, {}, observers, "manager").find(
      (g) => g.forceId === "rayonner_assertivite"
    )!;
    expect(hidden.other).toBeNull();
    // Avec consentement explicite : affiché.
    const shown = computeGaps(data, {}, observers, "manager", { bypassThreshold: true }).find(
      (g) => g.forceId === "rayonner_assertivite"
    )!;
    expect(shown.other).toBeCloseTo(5, 5);
    expect(shown.nRespondents).toBe(1);
  });
});

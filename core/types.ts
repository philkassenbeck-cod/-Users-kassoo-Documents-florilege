// core/types.ts
// Types unifiés du noyau Florilège (self + 360 + origine + familles).
// PUR : aucune dépendance à Next, React, à l'auth ou au réseau.

export type Lang = "fr" | "en";
export type Localized = Record<Lang, string>;

// ---------- Contenu (miroir du JSON, source de vérité) ----------

export interface FlorilegeItem {
  id: string;
  reverse: boolean;
  text: Localized;
  /** true = l'item existe aussi en version observateur (360). */
  in360?: boolean;
  /** Gabarit observateur avec {name}. Présent seulement si in360. */
  observer?: Localized;
}

/** Libellé de force, avec les deux libellés candidats optionnels. */
export type ForceLabel = Localized & { alt_fr?: string; alt_en?: string };

export interface FlorilegeForce {
  id: string;
  family: string;
  label: ForceLabel;
  facet: Localized;
  items: FlorilegeItem[];
}

export interface Family {
  id: string;
  label: Localized;
  big_five: string;
  big_five_en: string;
}

// ---------- Couche origine (Gabor Maté), NON scorée ----------

export interface OriginReading {
  reading: Localized;
  prompt: Localized;
}

export interface OriginLayer {
  disclaimer: Localized;
  by_family: Record<string, OriginReading>;
}

// ---------- 360 ----------

export interface Circle {
  id: string;
  label: Localized;
  can_be_named: boolean;
}

export interface JohariQuadrant {
  label: Localized;
  rule?: string;
  line: Localized;
}

export interface ThreeSixty {
  observer_items_per_force: number;
  observer_form_length: number;
  estimated_seconds: number;
  subject_pronoun: { options: string[]; default: string; note?: string };
  circles: Circle[];
  anonymity: {
    min_respondents_per_circle: number;
    below_threshold?: string;
    named_manager_requires_consent: boolean;
    default?: string;
  };
  reporting: {
    count_vs_percent: { percent_threshold: number; rule?: string; high_cut: number };
  };
  johari: {
    high_cut: number;
    gap_significant: number;
    quadrants: Record<string, JohariQuadrant>;
  };
  privacy?: Record<string, unknown>;
}

// ---------- Meta + racine ----------

export interface FlorilegeMeta {
  name: string;
  version: string;
  author: string;
  positioning: string;
  estimated_minutes: number;
  languages: Lang[];
  scale: { min: number; max: number; labels: Record<Lang, string[]> };
  scoring: {
    items_per_force: number;
    reverse_recode: string;
    force_score: string;
    florilege_size: number;
    note?: string;
  };
  config?: Record<string, unknown>;
}

export interface FlorilegeData {
  meta: FlorilegeMeta;
  families: Family[];
  forces: FlorilegeForce[];
  origin_layer: OriginLayer;
  three_sixty: ThreeSixty;
}

// ---------- Entrées / sorties du scoring ----------

/** Réponses brutes : { [itemId]: valeur 1..5 }. */
export type Responses = Record<string, number>;

export interface ForceScore {
  forceId: string;
  family: string;
  score: number; // moyenne recodée, échelle 1..5
  answered: number;
  expected: number;
}

export interface FlorilegeResult {
  scores: ForceScore[]; // toutes les forces, triées décroissant
  florilege: ForceScore[]; // top N (défaut 3)
  complete: boolean;
}

/** Une réponse observateur, anonyme, rattachée à un cercle. */
export interface ObserverResponse {
  circle: string;
  responses: Record<string, number>; // { itemId: 1..5 } sur les 16 items 360
}

export interface ForceGap {
  forceId: string;
  family: string;
  self: number;
  other: number | null; // null si sous le seuil d'anonymat
  delta: number | null; // other - self
  nRespondents: number;
  nHigh: number;
  quadrant: string | null; // clé Johari
}

export interface CircleView {
  circleId: string;
  visible: boolean;
  gaps: ForceGap[];
  n: number;
}

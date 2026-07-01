// core/index.ts
// Barrel du noyau : point d'entrée unique. L'app n'importe QUE depuis "@core".
// Le jour de la réintégration, ce dossier se déplace tel quel.

export * from "./types";
export { florilegeData, default as data } from "./data";

// Scoring self
export {
  recode,
  scoreForce,
  computeFlorilege,
  cronbachAlpha,
} from "./scoring/self";

// Scoring 360
export {
  computeGaps,
  classifyJohari,
  extractPepites,
  highPhrase,
  johariLine,
  byCircle,
} from "./scoring/three-sixty";

// Aides d'affichage
export {
  LANGS,
  forceLabel,
  familyLabel,
  findForce,
  findFamily,
  scaleLabels,
} from "./i18n";

// Ordonnancement des items
export {
  interleavedSelfItems,
  observerItems,
  observerText,
} from "./items";
export type { ServedItem, ObserverItem } from "./items";

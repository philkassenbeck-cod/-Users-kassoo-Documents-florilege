// core/data.ts
// Charge le JSON (source de vérité unique) et l'expose typé.
// Le JSON est importé statiquement : aucun fetch, aucune I/O.

import raw from "./data/florilege-data-360.json";
import type { FlorilegeData } from "./types";

export const florilegeData = raw as unknown as FlorilegeData;

export default florilegeData;

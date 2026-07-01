# `core/` — Noyau Florilège (pur & isolé)

**Contrat :** ce dossier ne dépend de rien de l'application.
Aucun `import` de Next, React, d'une base de données, du réseau ou de l'auth.
Il ne contient que : les **données** (source de vérité), le **scoring** et les **types**.

## Contenu

| Fichier | Rôle |
|---|---|
| `data/florilege-data-360.json` | Source de vérité unique (4 familles, 8 forces, 48 items self, 16 items 360, couche origine, schéma 360). |
| `data.ts` | Importe le JSON et l'expose typé (`florilegeData`). |
| `types.ts` | Tous les types (self + 360 + origine + familles). |
| `scoring/self.ts` | Test self : recodage, moyenne par force, florilège (top 3), α de Cronbach. |
| `scoring/three-sixty.ts` | 360 : agrégats, écarts soi/autrui, Johari, pépites, seuils d'anonymat. |
| `i18n.ts` | Aides d'affichage bilingues **pures** (`forceLabel`, `familyLabel`, `scaleLabels`…). |
| `items.ts` | Ordonnancement déterministe des items (48 self entrelacés, 16 observateur). |
| `index.ts` | Barrel : **seul** point d'entrée. L'app importe uniquement depuis `@core`. |

## Deux couches, jamais mélangées

1. **Mesure** — les 8 forces scorées, le florilège. Voir `scoring/`.
2. **Sens (origine, Gabor Maté)** — `origin_layer` dans le JSON. **Non scorée.**
   Toujours afficher `origin_layer.disclaimer`. Le noyau ne fait que porter le
   contenu ; c'est l'app qui le propose *après* le résultat, en invitation douce.

## Réintégration dans un autre projet

1. Copier le dossier `core/` tel quel.
2. Ajouter l'alias TS : `"@core": ["./core/index.ts"]`, `"@core/*": ["./core/*"]`
   (nécessite `resolveJsonModule: true`).
3. Importer : `import { computeFlorilege, florilegeData } from "@core";`

Aucune réécriture nécessaire.

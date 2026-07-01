# Florilège — Optimup

Diagnostic de forces (leadership) fondé sur des construits validés (Big Five).
Produit **autonome** (marque, passation self + 360, débriefs, lettre de coaching),
conçu pour être **réintégré** plus tard dans un autre projet Next.js.

> Positionnement : « diagnostic de forces fondé sur des construits validés (Big Five) ».
> Pas « test psychométriquement validé » tant que l'analyse factorielle (Phase 2) n'est pas faite.
> Contenu 100 % Optimup — aucun contenu tiers.

## Architecture

```
core/    NOYAU PUR & ISOLÉ — données + scoring + types. Zéro dépendance à l'app.
         → copiable tel quel dans un autre projet (voir core/README.md).
app/     Next.js App Router — pages, API, débriefs, lettre.
components/  Design-system Optimup (charte jewel-ink + laiton) + langue FR/EN.
content/     Contenu éditorial (phrases, gestes, libellés UI) — hors noyau.
lib/         Plomberie (store 360, tokens).
supabase/    schema.sql pour la persistance production.
```

La règle : **`app/` consomme `@core`, jamais l'inverse.** Le jour de la réintégration,
on déplace `core/` sans rien réécrire (ajouter l'alias `@core` dans le projet cible).

## Parcours

| Route | Rôle |
|---|---|
| `/` | Page d'accueil / vente |
| `/diagnostic` | Passation self (48 items entrelacés, Likert 1–5) |
| `/diagnostic/resultat` | Débrief self : 3 notes + origine au tap + constellation |
| `/360` | Invitation : cercles + génération d'un lien par répondant (RGPD) |
| `/r/[token]` | Formulaire répondant : consentement + 16 items (~60 s) |
| `/360/resultat?id=` | Débrief 360 : pépites, quadrants Johari, seuils d'anonymat |
| `/lettre` | Lettre de coaching imprimable (Imprimer → PDF) |

## Développement

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # tests du noyau (vitest)
npm run build
```

## Persistance (360)

Par défaut : **adaptateur mémoire** (dev/démo — non partagé entre instances serverless).
Production : appliquer `supabase/schema.sql`, implémenter `SupabaseStore` et l'activer
dans `lib/store.ts` (le seam est documenté). Variables : voir `.env.example`.

## Déploiement

Déploiement manuel via l'éditeur web GitHub → Vercel (aucun déploiement automatique).
Racine du projet Vercel : `./`.

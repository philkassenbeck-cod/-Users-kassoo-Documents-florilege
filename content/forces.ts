// content/forces.ts — contenu ÉDITORIAL par force (couche récit, hors noyau).
// Le noyau porte la MESURE (scores) et le SENS (origine par famille).
// Ici : la définition, la phrase-miroir, le geste « en équipe », le fragment de signature.
// Ces textes sont propres à Optimup (aucun contenu Gallup).

import type { Lang } from "@core";

type L = Record<Lang, string>;

export interface ForceCopy {
  definition: L; // ce qu'est la force, en clair (une ligne)
  phrase: L; // phrase-miroir, dite à la personne
  nugget: L; // un geste actionnable en équipe
  signature: L; // fragment court pour composer la phrase-signature
}

export const forceContent: Record<string, ForceCopy> = {
  accomplir_industrie: {
    definition: {
      fr: "Aller au bout de ce qu'on entreprend, tenir l'effort dans la durée.",
      en: "Seeing things through, sustaining effort over time.",
    },
    phrase: {
      fr: "Vous tenez quand les autres lâchent.",
      en: "You hold on when others let go.",
    },
    nugget: {
      fr: "Montrez le prochain palier, pas seulement le sommet : l'endurance se partage.",
      en: "Show the next milestone, not just the summit — stamina is shared.",
    },
    signature: { fr: "tient la distance", en: "goes the distance" },
  },
  accomplir_ordre: {
    definition: {
      fr: "Organiser, structurer, tenir le cap avec méthode.",
      en: "Organising, structuring, holding course with method.",
    },
    phrase: {
      fr: "Vous transformez le flou en plan.",
      en: "You turn the blur into a plan.",
    },
    nugget: {
      fr: "Laissez une marge d'improvisation : la méthode libère, elle n'enferme pas.",
      en: "Leave room to improvise — method should free, not cage.",
    },
    signature: { fr: "avance avec méthode", en: "moves with method" },
  },
  rayonner_assertivite: {
    definition: {
      fr: "Oser, décider, prendre l'initiative sans attendre.",
      en: "Daring, deciding, taking initiative without waiting.",
    },
    phrase: {
      fr: "Vous tranchez quand les autres hésitent.",
      en: "You decide while others hesitate.",
    },
    nugget: {
      fr: "Laissez un silence après avoir tranché : il fait entrer les autres.",
      en: "Leave a silence after you decide — it lets others in.",
    },
    signature: { fr: "tranche vite", en: "decides fast" },
  },
  rayonner_enthousiasme: {
    definition: {
      fr: "Entraîner les autres par son énergie et sa présence.",
      en: "Carrying others through energy and presence.",
    },
    phrase: {
      fr: "Votre énergie se voit avant vos mots.",
      en: "Your energy shows before your words.",
    },
    nugget: {
      fr: "Baissez parfois d'un ton : votre présence laisse alors place à celle des autres.",
      en: "Dial it down at times — your presence then makes room for others'.",
    },
    signature: { fr: "entraîne les autres", en: "carries the room" },
  },
  relier_compassion: {
    definition: {
      fr: "Percevoir et accueillir ce que vit l'autre.",
      en: "Sensing and welcoming what others feel.",
    },
    phrase: {
      fr: "Vous entendez ce qui ne se dit pas.",
      en: "You hear what goes unsaid.",
    },
    nugget: {
      fr: "Nommez à voix haute ce que vous sentez : votre lecture devient une force d'équipe.",
      en: "Say aloud what you sense — your read becomes a team strength.",
    },
    signature: { fr: "sent juste", en: "senses true" },
  },
  relier_politesse: {
    definition: {
      fr: "Chercher l'accord, préserver l'harmonie du groupe.",
      en: "Seeking agreement, keeping the group in harmony.",
    },
    phrase: {
      fr: "Vous faites tenir le groupe ensemble.",
      en: "You keep the group together.",
    },
    nugget: {
      fr: "Osez la friction utile : préserver le lien n'est pas éviter le désaccord.",
      en: "Dare useful friction — protecting the bond isn't avoiding disagreement.",
    },
    signature: { fr: "tisse le lien", en: "weaves the bond" },
  },
  imaginer_intellect: {
    definition: {
      fr: "Penser l'avenir, relier les idées, ouvrir des possibles.",
      en: "Thinking ahead, connecting ideas, opening possibilities.",
    },
    phrase: {
      fr: "Vous vivez déjà dans l'après.",
      en: "You already live in what's next.",
    },
    nugget: {
      fr: "Redescendez le futur en trois prochains pas — votre équipe suivra.",
      en: "Bring the future down to the next three steps — your team will follow.",
    },
    signature: { fr: "voit loin", en: "sees far" },
  },
  imaginer_ouverture: {
    definition: {
      fr: "Explorer, apprendre, remettre en question ses certitudes.",
      en: "Exploring, learning, questioning your certainties.",
    },
    phrase: {
      fr: "Rien ne vous ferme, tout vous appelle.",
      en: "Nothing closes you off; everything calls.",
    },
    nugget: {
      fr: "Choisissez une piste et creusez : la curiosité devient force quand elle se pose.",
      en: "Pick one thread and dig — curiosity becomes strength when it lands.",
    },
    signature: { fr: "explore sans cesse", en: "keeps exploring" },
  },
};

/** Compose la phrase-signature à partir des 3 fragments du florilège. */
export function composeSignature(forceIds: string[], lang: Lang): string {
  const frags = forceIds
    .map((id) => forceContent[id]?.signature[lang])
    .filter(Boolean) as string[];
  if (frags.length === 0) return "";
  const head = lang === "fr" ? "Un leader qui " : "A leader who ";
  if (frags.length === 1) return `${head}${frags[0]}.`;
  const last = frags[frags.length - 1];
  const rest = frags.slice(0, -1).join(", ");
  const conj = lang === "fr" ? ", et " : ", and ";
  return `${head}${rest}${conj}${last}.`;
}

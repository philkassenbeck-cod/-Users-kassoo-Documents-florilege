// content/forces.ts — contenu ÉDITORIAL par force (couche récit, hors noyau).
// Le noyau porte la MESURE (scores) et le SENS (origine par famille).
// Ici : definition (courte, constellation), description (explicite, cartes + lettre),
// phrase-miroir, geste « en équipe », fragment de signature. Propre à Optimup.

import type { Lang } from "@core";

type L = Record<Lang, string>;

export interface ForceCopy {
  definition: L; // courte — pour la constellation
  description: L; // explicite (2 phrases) — le « verdict » sur les cartes + la lettre
  phrase: L; // phrase-miroir
  nugget: L; // geste actionnable en équipe
  signature: L; // fragment pour la phrase-signature
}

export const forceContent: Record<string, ForceCopy> = {
  accomplir_industrie: {
    definition: {
      fr: "Aller au bout de ce qu'on entreprend, tenir l'effort dans la durée.",
      en: "Seeing things through, sustaining effort over time.",
    },
    description: {
      fr: "Vous allez au bout de ce que vous entreprenez et tenez l'effort dans la durée, même quand la motivation retombe ou que les obstacles s'accumulent. Concrètement, on peut compter sur vous pour transformer une intention en résultat sans lâcher en cours de route — c'est vous qui êtes encore là quand les autres ont renoncé.",
      en: "You see through what you take on and sustain the effort over time, even when motivation dips or obstacles pile up. In practice, people can count on you to turn an intention into a result without dropping it midway — you're the one still there when others have given up.",
    },
    phrase: { fr: "Vous tenez quand les autres lâchent.", en: "You hold on when others let go." },
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
    description: {
      fr: "Vous organisez, structurez et anticipez : vous transformez le flou en un plan clair et tenez le cap avec méthode plutôt qu'à l'improvisation. Votre entourage sait qu'avec vous rien n'est laissé au hasard, les priorités sont nettes et les échéances tenues — ce qui rassure et fait avancer les projets.",
      en: "You organise, structure and plan ahead: you turn vagueness into a clear plan and hold course with method rather than improvisation. People around you know that with you nothing is left to chance — priorities are sharp and deadlines are met, which reassures everyone and moves projects forward.",
    },
    phrase: { fr: "Vous transformez le flou en plan.", en: "You turn the blur into a plan." },
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
    description: {
      fr: "Vous osez décider et prendre l'initiative sans attendre qu'on vous y invite, et vous défendez votre point de vue même face à l'opposition. Là où beaucoup hésitent, vous tranchez et faites avancer les choses — quitte à assumer seul·e le risque d'un choix : c'est souvent vous qui débloquez une situation qui s'enlisait.",
      en: "You dare to decide and take initiative without waiting to be invited, and you stand by your view even against opposition. Where many hesitate, you cut through and move things forward — even if it means owning the risk of a call on your own: you're often the one who unblocks a situation that was stalling.",
    },
    phrase: { fr: "Vous tranchez quand les autres hésitent.", en: "You decide while others hesitate." },
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
    description: {
      fr: "Votre énergie et votre chaleur se remarquent : vous entraînez les autres et rendez une idée vivante rien que par votre présence dans la pièce. Dans un groupe, on vous suit souvent parce que vous donnez envie, pas seulement parce que vous avez raison — vous savez mettre du mouvement et de l'élan là où il en manquait.",
      en: "Your energy and warmth are noticed: you carry others along and bring an idea to life just by being in the room. In a group, people often follow you because you make them want to, not only because you're right — you bring momentum and drive where it was missing.",
    },
    phrase: { fr: "Votre énergie se voit avant vos mots.", en: "Your energy shows before your words." },
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
    description: {
      fr: "Vous percevez vite ce que vit la personne en face, souvent avant qu'elle ne le dise, et vous ajustez votre attitude en conséquence. Les gens se sentent lus et accueillis avec vous, ce qui crée de la confiance et dénoue les tensions — vous captez ce qui se joue sous la surface d'une conversation ou d'une équipe.",
      en: "You quickly sense what the person in front of you is going through, often before they say it, and you adjust accordingly. People feel read and welcomed around you, which builds trust and defuses tension — you pick up what's really at play beneath the surface of a conversation or a team.",
    },
    phrase: { fr: "Vous entendez ce qui ne se dit pas.", en: "You hear what goes unsaid." },
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
    description: {
      fr: "Vous cherchez l'accord et la coopération plutôt que le rapport de force, et vous veillez à préserver l'harmonie du groupe en tenant compte des besoins de chacun. Vous êtes souvent celui ou celle qui fait tenir les gens ensemble et désamorce les tensions avant qu'elles n'éclatent — le lien, avec vous, ne casse pas.",
      en: "You seek agreement and cooperation over power struggles, and you work to preserve the group's harmony by accounting for everyone's needs. You're often the one who keeps people together and defuses tension before it erupts — with you, the bond doesn't break.",
    },
    phrase: { fr: "Vous faites tenir le groupe ensemble.", en: "You keep the group together." },
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
    description: {
      fr: "Vous pensez naturellement en termes d'avenir : vous reliez des idées venues d'horizons différents et voyez où les choses peuvent mener avant les autres. Concrètement, vous êtes celui ou celle qui donne un cap et ouvre des possibles quand le reste du groupe est encore dans le présent — votre valeur, c'est la perspective.",
      en: "You naturally think in terms of what's ahead: you connect ideas from different fields and see where things can lead before others do. In practice, you're the one who sets a direction and opens up possibilities while the group is still in the present — your value is perspective.",
    },
    phrase: { fr: "Vous vivez déjà dans l'après.", en: "You already live in what's next." },
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
    description: {
      fr: "Vous avez un besoin constant d'apprendre, d'explorer et de remettre en question vos propres certitudes plutôt que de vous contenter de l'acquis. La nouveauté vous stimule, et vous apportez au groupe des angles et des idées qu'on n'aurait pas trouvés sans vous — vous empêchez les choses de s'endormir.",
      en: "You have a constant need to learn, explore and question your own certainties rather than settle for the familiar. Novelty energises you, and you bring the group angles and ideas it wouldn't have found without you — you keep things from going stale.",
    },
    phrase: { fr: "Rien ne vous ferme, tout vous appelle.", en: "Nothing closes you off; everything calls." },
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

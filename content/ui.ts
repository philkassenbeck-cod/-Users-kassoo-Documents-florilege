// content/ui.ts — libellés d'INTERFACE bilingues (hors data du noyau).

import type { Lang } from "@core";

type L = Record<Lang, string>;
type Dict = Record<string, L>;

export const UI: Dict = {
  brand: { fr: "OPTIMUP · FLORILÈGE", en: "OPTIMUP · FLORILÈGE" },

  // Landing / page de vente (version courte, étape 2)
  landingEyebrow: { fr: "OPTIMUP · DIAGNOSTIC DE FORCES", en: "OPTIMUP · STRENGTHS DIAGNOSTIC" },
  landingTitle: { fr: "Votre florilège", en: "Your florilège" },
  landingSubtitle: {
    fr: "Trois forces dominantes. Une signature.",
    en: "Three dominant strengths. One signature.",
  },
  landingBody: {
    fr: "Un diagnostic de forces fondé sur des construits validés (Big Five). Huit minutes pour révéler, parmi vos huit forces, les trois qui vous signent.",
    en: "A strengths diagnostic grounded in validated constructs (Big Five). Eight minutes to reveal, among your eight strengths, the three that sign you.",
  },
  landingCta: { fr: "Commencer le diagnostic", en: "Start the diagnostic" },
  landingMinutes: { fr: "≈ 8 minutes · FR / EN", en: "≈ 8 minutes · FR / EN" },

  // Inscription (début du test)
  startTitle: { fr: "Avant de commencer", en: "Before you begin" },
  startBody: {
    fr: "Entrez votre prénom et votre email : on garde votre florilège et on vous envoie votre lien pour y revenir quand vous voulez.",
    en: "Enter your first name and email: we keep your florilège and send you a link to come back anytime.",
  },
  startBtn: { fr: "Commencer le diagnostic", en: "Start the diagnostic" },

  // Passation
  passationEyebrow: { fr: "LE DIAGNOSTIC", en: "THE DIAGNOSTIC" },
  progressOf: { fr: "sur", en: "of" },
  back: { fr: "Précédent", en: "Back" },
  passationHint: {
    fr: "Répondez spontanément — il n'y a pas de bonne réponse.",
    en: "Answer spontaneously — there is no right answer.",
  },
  computing: { fr: "Composition de votre florilège…", en: "Composing your florilège…" },

  // Débrief self
  reveal: { fr: "Révéler mon florilège", en: "Reveal my florilège" },
  revealHint: {
    fr: "8 minutes suffisent. Voici ce qu'elles ont dit de vous.",
    en: "Eight minutes was enough. Here's what they said about you.",
  },

  // Gate de révélation (prénom + email → persistance + envoi du lien)
  gateTitle: { fr: "Révélez et conservez votre florilège", en: "Reveal and keep your florilège" },
  gateBody: {
    fr: "Entrez votre prénom et votre email : on vous envoie votre lien personnel pour y revenir quand vous voulez — et lancer le 360 plus tard.",
    en: "Enter your first name and email: we'll send you a personal link to come back anytime — and launch the 360 later.",
  },
  gateName: { fr: "Prénom", en: "First name" },
  gateEmail: { fr: "Email", en: "Email" },
  gateSending: { fr: "Un instant…", en: "One moment…" },
  gateEmailSent: { fr: "Lien envoyé à", en: "Link sent to" },
  gateKeepLink: { fr: "Votre lien à conserver", en: "Your link to keep" },
  notes: {
    fr: "Note de tête|Note de cœur|Note de fond",
    en: "Top note|Heart note|Base note",
  },
  flipHint: { fr: "toucher pour l'origine", en: "tap for its origin" },
  backHint: { fr: "revenir à la force", en: "back to the strength" },
  originLabel: { fr: "D'où vient cette force ?", en: "Where does this strength come from?" },
  nuggetLabel: { fr: "En équipe", en: "With your team" },
  signatureLabel: { fr: "En une phrase", en: "In one line" },
  constTitle: { fr: "Vos huit forces", en: "Your eight strengths" },

  // Résultat sans données
  noResultTitle: { fr: "Aucun florilège pour l'instant", en: "No florilège yet" },
  noResultBody: {
    fr: "Passez le diagnostic pour révéler vos trois forces dominantes.",
    en: "Take the diagnostic to reveal your three dominant strengths.",
  },

  // Passerelle self → 360
  ask360: { fr: "Demander le regard des autres", en: "Ask how others see you" },

  // 360 — invitation
  invEyebrow: { fr: "OPTIMUP · FLORILÈGE 360", en: "OPTIMUP · FLORILÈGE 360" },
  invTitle: { fr: "Le regard des autres", en: "How others see you" },
  invSubtitle: {
    fr: "Choisissez vos cercles. Générez un lien par personne. Tout reste anonyme.",
    en: "Choose your circles. Generate one link per person. Everything stays anonymous.",
  },
  invNameLabel: { fr: "Votre prénom", en: "Your first name" },
  invNamePlaceholder: { fr: "Prénom", en: "First name" },
  invCirclesLabel: { fr: "Vos cercles", en: "Your circles" },
  invCountHint: { fr: "liens à générer", en: "links to generate" },
  invGenerate: { fr: "Générer les liens", en: "Generate the links" },
  invNeedSelf: {
    fr: "Passez d'abord votre propre diagnostic : le 360 se compare à votre regard.",
    en: "Take your own diagnostic first: the 360 compares against your own view.",
  },
  invLinksTitle: { fr: "Vos liens répondants", en: "Your respondent links" },
  invLinksHint: {
    fr: "Partagez chaque lien à une personne. ~60 secondes de réponse, anonyme.",
    en: "Share each link with one person. ~60 seconds to answer, anonymous.",
  },
  invCopy: { fr: "Copier", en: "Copy" },
  invCopied: { fr: "Copié", en: "Copied" },
  invSeeResult: { fr: "Voir mon débrief 360", en: "See my 360 debrief" },
  invDeleteAll: { fr: "Tout supprimer", en: "Delete everything" },
  invDeleteConfirm: {
    fr: "Supprimer définitivement ce 360 et toutes les réponses ?",
    en: "Permanently delete this 360 and all responses?",
  },
  invThreshold: {
    fr: "Un cercle n'apparaît qu'à partir de 3 réponses (anonymat).",
    en: "A circle only appears from 3 responses onward (anonymity).",
  },

  // 360 — formulaire répondant
  respConsentTitle: { fr: "Un regard, en confiance", en: "An honest look" },
  respConsentBody: {
    fr: "On vous demande votre regard sur {name}. 16 affirmations, ~60 secondes. Vos réponses sont anonymes et agrégées : {name} ne verra jamais qui a répondu quoi.",
    en: "You're asked for your view of {name}. 16 statements, ~60 seconds. Your answers are anonymous and aggregated: {name} will never see who said what.",
  },
  respConsentAccept: { fr: "J'accepte et je commence", en: "I agree and start" },
  respScaleHint: { fr: "À quel point êtes-vous d'accord ?", en: "How much do you agree?" },
  respSubmit: { fr: "Envoyer mon regard", en: "Send my view" },
  respThanksTitle: { fr: "Merci", en: "Thank you" },
  respThanksBody: {
    fr: "Votre regard est enregistré. Il rejoindra celui des autres, en toute confidentialité.",
    en: "Your view is recorded. It will join the others, in full confidence.",
  },
  respDone: { fr: "Ce lien a déjà été utilisé.", en: "This link has already been used." },
  respInvalid: { fr: "Lien invalide ou expiré.", en: "Invalid or expired link." },

  // Signature manager (cercle can_be_named) — consentement explicite
  respSignTitle: { fr: "Signer votre regard ?", en: "Sign your view?" },
  respSignBody: {
    fr: "En tant que manager, vous pouvez accepter d'être cité·e nommément auprès de {name}. C'est facultatif : sans cela, votre réponse reste strictement anonyme.",
    en: "As a manager, you may agree to be named to {name}. It's optional: otherwise your answer stays strictly anonymous.",
  },
  respSignPlaceholder: { fr: "Votre nom", en: "Your name" },
  respSignConfirm: { fr: "Envoyer en étant cité·e", en: "Send, named" },
  respSignSkip: { fr: "Rester anonyme", en: "Stay anonymous" },

  // 360 — débrief
  dbYou: { fr: "Vous", en: "You" },
  dbOthers: { fr: "Autres", en: "Others" },
  dbAll: { fr: "Tous", en: "All" },
  dbResp: { fr: "réponses · anonymes", en: "responses · anonymous" },
  dbLocked: { fr: "3 réponses minimum", en: "3 responses minimum" },
  dbPepiteTitle: {
    fr: "Ce qu'ils ont vu que vous ne voyez pas",
    en: "What they saw that you don't",
  },
  dbFooter: {
    fr: "L'écart n'est pas un jugement : c'est une conversation qui commence.",
    en: "A gap isn't a verdict — it's a conversation starting.",
  },
  dbWaiting: {
    fr: "Pas encore assez de réponses. Revenez quand vos cercles auront répondu.",
    en: "Not enough responses yet. Come back once your circles have answered.",
  },
  dbNamedManager: {
    fr: "{name}, votre manager, a accepté d'être cité·e nommément.",
    en: "{name}, your manager, agreed to be named.",
  },

  // Lettre de coaching (PDF via impression)
  letterCta: { fr: "Ma lettre de coaching", en: "My coaching letter" },
  letterEyebrow: { fr: "OPTIMUP · LETTRE DE COACHING", en: "OPTIMUP · COACHING LETTER" },
  letterPrint: { fr: "Imprimer / Enregistrer en PDF", en: "Print / Save as PDF" },
  letterGreeting: { fr: "Bonjour", en: "Hello" },
  letterOpen: {
    fr: "Voici votre florilège : les trois forces qui, aujourd'hui, vous signent. Non pas tout ce que vous êtes, mais ce qui ressort le plus nettement — une signature, à cultiver.",
    en: "Here is your florilège: the three strengths that, today, sign you. Not all that you are, but what stands out most clearly — a signature, to cultivate.",
  },
  letterNotesTitle: { fr: "Vos trois notes", en: "Your three notes" },
  letterTeam: { fr: "En équipe", en: "With your team" },
  letter360Title: { fr: "Le regard des autres", en: "How others see you" },
  letterOriginTitle: { fr: "D'où viennent vos forces", en: "Where your strengths come from" },
  letterOriginQuestion: { fr: "Une question à explorer", en: "A question to explore" },
  letterSignatureTitle: { fr: "En une phrase", en: "In one line" },
  letterClose: {
    fr: "Prenez ces pages comme un miroir, pas comme un verdict. À vous d'en faire quelque chose.",
    en: "Take these pages as a mirror, not a verdict. What you make of them is yours.",
  },
  letterNeedSelf: {
    fr: "Passez d'abord le diagnostic : la lettre se compose à partir de votre florilège.",
    en: "Take the diagnostic first: the letter is composed from your florilège.",
  },

  // 360 : besoin d'une personne enregistrée
  need360: {
    fr: "Passez d'abord votre diagnostic et enregistrez votre florilège : le 360 s'y rattache.",
    en: "Take your diagnostic and save your florilège first: the 360 attaches to it.",
  },

  // Admin
  adminTitle: { fr: "Florilège · Admin", en: "Florilège · Admin" },
  adminPassword: { fr: "Mot de passe", en: "Password" },
  adminLogin: { fr: "Entrer", en: "Enter" },
  adminWrong: { fr: "Mot de passe invalide.", en: "Invalid password." },
  adminEmpty: { fr: "Aucune personne pour l'instant.", en: "No one yet." },
  adminColName: { fr: "Personne", en: "Person" },
  adminColDate: { fr: "Date", en: "Date" },
  adminCol360: { fr: "360 (liens · réponses)", en: "360 (links · responses)" },
  adminView: { fr: "Florilège", en: "Florilège" },
  admin360: { fr: "Débrief 360", en: "360 debrief" },
};

/** Résout un libellé d'interface. */
export function tr(key: keyof typeof UI | string, lang: Lang): string {
  return UI[key]?.[lang] ?? String(key);
}

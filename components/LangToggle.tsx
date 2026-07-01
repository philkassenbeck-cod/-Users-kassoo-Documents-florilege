"use client";

import { useLang } from "./LanguageProvider";

/** Bouton de bascule FR/EN. Affiche la langue vers laquelle on bascule. */
export function LangToggle({ className = "" }: { className?: string }) {
  const { lang, toggle } = useLang();
  return (
    <button className={`fl-btn fl-lang ${className}`} onClick={toggle} aria-label="Language">
      {lang === "fr" ? "EN" : "FR"}
    </button>
  );
}

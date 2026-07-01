"use client";

// Contexte de langue FR/EN — bascule dynamique (pas de routes /fr /en).
// Les données du noyau sont déjà bilingues ; on ne fait que porter la langue active.

import { createContext, useContext, useEffect, useState } from "react";
import type { Lang } from "@core";

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
}

const Ctx = createContext<LangCtx | null>(null);
const STORAGE_KEY = "florilege_lang";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");

  // Restaure la préférence après hydratation (évite un mismatch SSR).
  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (saved === "fr" || saved === "en") setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* stockage indisponible : sans effet */
    }
  };

  const toggle = () => setLang(lang === "fr" ? "en" : "fr");

  return <Ctx.Provider value={{ lang, setLang, toggle }}>{children}</Ctx.Provider>;
}

export function useLang(): LangCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLang doit être utilisé dans <LanguageProvider>");
  return ctx;
}

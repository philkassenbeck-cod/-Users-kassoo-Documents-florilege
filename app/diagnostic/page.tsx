"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  florilegeData as data,
  interleavedSelfItems,
  scaleLabels,
  familyLabel,
  type Responses,
} from "@core";
import { useLang } from "@/components/LanguageProvider";
import { LangToggle } from "@/components/LangToggle";
import { C, DISPLAY } from "@/components/theme";
import { tr } from "@/content/ui";

export const RESPONSES_KEY = "florilege_responses";

export default function Passation() {
  const { lang } = useLang();
  const router = useRouter();
  const served = useMemo(() => interleavedSelfItems(data), []);
  const labels = scaleLabels(data, lang);

  const [responses, setResponses] = useState<Responses>({});
  const [pos, setPos] = useState(0);

  const current = served[pos];
  const total = served.length;
  const answered = Object.keys(responses).length;
  const pct = Math.round((answered / total) * 100);

  function answer(value: number) {
    const next = { ...responses, [current.item.id]: value };
    setResponses(next);
    if (pos + 1 < total) {
      setPos(pos + 1);
    } else {
      // Passation terminée → on persiste et on file au débrief.
      try {
        window.sessionStorage.setItem(RESPONSES_KEY, JSON.stringify(next));
      } catch {
        /* stockage indisponible */
      }
      router.push("/diagnostic/resultat");
    }
  }

  return (
    <main className="fl-wrap" style={{ minHeight: "100vh", maxWidth: 720 }}>
      <div style={{ position: "absolute", top: 40, right: 22 }}>
        <LangToggle />
      </div>

      <div className="fl-hint" style={{ color: C.brass }}>
        {tr("passationEyebrow", lang)}
      </div>

      {/* Barre de progression */}
      <div style={{ marginTop: 22 }}>
        <div className="fl-track" style={{ height: 6 }}>
          <div
            style={{
              width: `${pct}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${C.brass}, ${C.brassSoft})`,
              borderRadius: 999,
              transition: "width .35s cubic-bezier(.2,.7,.2,1)",
            }}
          />
        </div>
        <div className="fl-hint" style={{ marginTop: 10 }}>
          {answered} {tr("progressOf", lang)} {total} · {familyLabel(data, current.family, lang)}
        </div>
      </div>

      {/* L'item courant */}
      <div style={{ minHeight: 160, display: "flex", alignItems: "center", margin: "44px 0 30px" }}>
        <p
          key={current.item.id}
          className="fl-rise"
          style={{
            fontFamily: DISPLAY,
            fontSize: "clamp(24px,4.4vw,34px)",
            lineHeight: 1.28,
            margin: 0,
          }}
        >
          {current.item.text[lang]}
        </p>
      </div>

      {/* Échelle de Likert */}
      <div className="fl-likert">
        {labels.map((label, i) => {
          const value = i + 1;
          const sel = responses[current.item.id] === value;
          return (
            <button
              key={value}
              className={"fl-btn fl-dot" + (sel ? " sel" : "")}
              onClick={() => answer(value)}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 34 }}>
        <button
          className="fl-btn"
          onClick={() => setPos(Math.max(0, pos - 1))}
          disabled={pos === 0}
          style={{
            background: "transparent",
            color: pos === 0 ? "rgba(154,147,168,.35)" : C.muted,
            fontSize: 13,
            letterSpacing: ".04em",
            padding: "8px 0",
          }}
        >
          ← {tr("back", lang)}
        </button>
        <span className="fl-hint" style={{ textTransform: "none", letterSpacing: 0 }}>
          {tr("passationHint", lang)}
        </span>
      </div>
    </main>
  );
}

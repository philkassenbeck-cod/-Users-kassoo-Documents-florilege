"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  florilegeData as data,
  interleavedSelfItems,
  scaleLabels,
  familyLabel,
  type Responses,
} from "@core";
import { supabase } from "@/lib/supabase-browser";
import { useLang } from "@/components/LanguageProvider";
import { LangToggle } from "@/components/LangToggle";
import { C, DISPLAY } from "@/components/theme";
import { tr } from "@/content/ui";

export const RESPONSES_KEY = "florilege_responses";
export const IDENTITY_KEY = "florilege_identity";

export default function Passation() {
  const { lang } = useLang();
  const router = useRouter();
  const served = useMemo(() => interleavedSelfItems(data), []);
  const labels = scaleLabels(data, lang);

  // Connexion requise (compte Supabase, comme LeadR)
  const [authReady, setAuthReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setAuthed(!!data.user);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setAuthed(!!session));
    return () => sub.subscription.unsubscribe();
  }, []);

  const [responses, setResponses] = useState<Responses>({});
  const [pos, setPos] = useState(0);
  const [started, setStarted] = useState(false);
  const [name, setName] = useState("");
  const canStart = name.trim().length > 0;

  function start() {
    if (!canStart) return;
    try {
      window.sessionStorage.setItem(IDENTITY_KEY, JSON.stringify({ name: name.trim() }));
    } catch {
      /* ignore */
    }
    setStarted(true);
  }

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
      try {
        window.sessionStorage.setItem(RESPONSES_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      router.push("/diagnostic/resultat");
    }
  }

  // 1) Attente de l'état de connexion
  if (!authReady) {
    return (
      <main className="fl-wrap" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: DISPLAY, fontStyle: "italic", color: C.muted }}>{tr("loading", lang)}</p>
      </main>
    );
  }

  // 2) Non connecté → invitation à se connecter
  if (!authed) {
    return (
      <main className="fl-wrap" style={{ minHeight: "100vh", maxWidth: 480 }}>
        <div style={{ position: "absolute", top: 40, right: 22 }}>
          <LangToggle />
        </div>
        <div style={{ marginTop: "16vh" }}>
          <div className="fl-hint" style={{ color: C.brass, marginBottom: 18 }}>
            {tr("passationEyebrow", lang)}
          </div>
          <h1 style={{ fontFamily: DISPLAY, fontSize: "clamp(30px,5vw,44px)", fontWeight: 400, margin: 0, lineHeight: 1.1 }}>
            {tr("needLoginTitle", lang)}
          </h1>
          <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.6, marginTop: 14, maxWidth: 440 }}>
            {tr("needLoginBody", lang)}
          </p>
          <Link href="/login" className="fl-btn fl-reveal" style={{ textDecoration: "none", display: "inline-block", marginTop: 22 }}>
            {tr("loginCta", lang)}
          </Link>
        </div>
      </main>
    );
  }

  // 3) Connecté mais pas commencé → prénom
  if (!started) {
    return (
      <main className="fl-wrap" style={{ minHeight: "100vh", maxWidth: 520 }}>
        <div style={{ position: "absolute", top: 40, right: 22 }}>
          <LangToggle />
        </div>
        <div style={{ marginTop: "16vh" }}>
          <div className="fl-hint" style={{ color: C.brass, marginBottom: 18 }}>
            {tr("passationEyebrow", lang)}
          </div>
          <h1 style={{ fontFamily: DISPLAY, fontSize: "clamp(30px,5vw,44px)", fontWeight: 400, margin: 0, lineHeight: 1.1 }}>
            {tr("startTitle", lang)}
          </h1>
          <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.6, marginTop: 14, maxWidth: 440 }}>
            {tr("startBody", lang)}
          </p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && start()}
            placeholder={tr("gateName", lang)}
            maxLength={60}
            style={introInput}
          />
          <button
            className="fl-btn fl-reveal"
            onClick={start}
            disabled={!canStart}
            style={{ marginTop: 20, opacity: canStart ? 1 : 0.45 }}
          >
            {tr("startBtn", lang)}
          </button>
        </div>
      </main>
    );
  }

  // 4) Le test
  return (
    <main className="fl-wrap" style={{ minHeight: "100vh", maxWidth: 720 }}>
      <div style={{ position: "absolute", top: 40, right: 22 }}>
        <LangToggle />
      </div>

      <div className="fl-hint" style={{ color: C.brass }}>
        {tr("passationEyebrow", lang)}
      </div>

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

      <div style={{ minHeight: 160, display: "flex", alignItems: "center", margin: "44px 0 30px" }}>
        <p key={current.item.id} className="fl-rise" style={{ fontFamily: DISPLAY, fontSize: "clamp(24px,4.4vw,34px)", lineHeight: 1.28, margin: 0 }}>
          {current.item.text[lang]}
        </p>
      </div>

      <div className="fl-likert">
        {labels.map((label, i) => {
          const value = i + 1;
          const sel = responses[current.item.id] === value;
          return (
            <button key={value} className={"fl-btn fl-dot" + (sel ? " sel" : "")} onClick={() => answer(value)}>
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
          style={{ background: "transparent", color: pos === 0 ? "rgba(154,147,168,.35)" : C.muted, fontSize: 13, letterSpacing: ".04em", padding: "8px 0" }}
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

const introInput: React.CSSProperties = {
  display: "block",
  width: "100%",
  maxWidth: 340,
  marginTop: 12,
  padding: "12px 16px",
  borderRadius: 12,
  border: `1px solid ${C.line}`,
  background: C.panel,
  color: C.porcelain,
  fontSize: 16,
  fontFamily: DISPLAY,
};

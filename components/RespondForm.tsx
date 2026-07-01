"use client";

// Micro-formulaire répondant (360) — 16 items, ~60 s, style téléphone.
// Consentement à l'ouverture (RGPD) avant tout accès aux items.

import { useEffect, useMemo, useState } from "react";
import {
  florilegeData as data,
  observerItems,
  observerText,
  scaleLabels,
  type Lang,
} from "@core";
import { C, DISPLAY } from "./theme";
import { UI } from "@/content/ui";

interface Meta {
  name: string;
  lang: Lang;
  circle: string;
  responded: boolean;
}

type Phase = "loading" | "invalid" | "done" | "consent" | "form" | "thanks";

export function RespondForm({ token }: { token: string }) {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [pos, setPos] = useState(0);
  const [busy, setBusy] = useState(false);

  const items = useMemo(() => observerItems(data), []);
  const lang: Lang = meta?.lang ?? "fr";
  const t = (k: keyof typeof UI) => UI[k]?.[lang] ?? String(k);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/respond?token=${token}`);
        if (!res.ok) {
          setPhase("invalid");
          return;
        }
        const m = (await res.json()) as Meta;
        setMeta(m);
        setPhase(m.responded ? "done" : "consent");
      } catch {
        setPhase("invalid");
      }
    })();
  }, [token]);

  const labels = meta ? scaleLabels(data, lang) : [];
  const current = items[pos];
  const total = items.length;

  async function answer(value: number) {
    const next = { ...answers, [current.id]: value };
    setAnswers(next);
    if (pos + 1 < total) {
      setPos(pos + 1);
    } else {
      await submit(next);
    }
  }

  async function submit(finalAnswers: Record<string, number>) {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, answers: finalAnswers }),
      });
      setPhase(res.ok ? "thanks" : "done");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fl-phone-stage">
      <div className="fl-phone">
        <div className="fl-scroll" style={{ minHeight: 520 }}>
          <div className="fl-hint" style={{ color: C.brass, marginBottom: 18 }}>
            {UI.invEyebrow[lang]}
          </div>

          {phase === "loading" && <p style={{ color: C.muted }}>…</p>}

          {phase === "invalid" && (
            <p style={{ fontFamily: DISPLAY, fontSize: 20, color: C.porcelain, marginTop: 30 }}>
              {t("respInvalid")}
            </p>
          )}

          {phase === "done" && (
            <p style={{ fontFamily: DISPLAY, fontSize: 20, color: C.porcelain, marginTop: 30 }}>
              {t("respDone")}
            </p>
          )}

          {phase === "consent" && meta && (
            <div className="fl-rise">
              <h1 style={{ fontFamily: DISPLAY, fontSize: 30, fontWeight: 400, lineHeight: 1.1, margin: 0 }}>
                {t("respConsentTitle")}
              </h1>
              <p style={{ fontSize: 14.5, lineHeight: 1.55, color: C.porcelain, marginTop: 18 }}>
                {t("respConsentBody").replace(/\{name\}/g, meta.name)}
              </p>
              <button
                className="fl-btn fl-reveal"
                style={{ marginTop: 26, width: "100%" }}
                onClick={() => setPhase("form")}
              >
                {t("respConsentAccept")}
              </button>
            </div>
          )}

          {phase === "form" && meta && current && (
            <div>
              {/* Progression */}
              <div className="fl-track" style={{ height: 5 }}>
                <div
                  style={{
                    width: `${(pos / total) * 100}%`,
                    height: "100%",
                    background: `linear-gradient(90deg, ${C.brass}, ${C.brassSoft})`,
                    borderRadius: 999,
                    transition: "width .3s ease",
                  }}
                />
              </div>
              <div className="fl-hint" style={{ marginTop: 10 }}>
                {pos + 1} / {total}
              </div>

              <p
                key={current.id}
                className="fl-rise"
                style={{ fontFamily: DISPLAY, fontSize: 22, lineHeight: 1.3, margin: "28px 0 6px" }}
              >
                {observerText(current.template, meta.name, lang)}
              </p>
              <div className="fl-hint" style={{ textTransform: "none", letterSpacing: 0, marginBottom: 16 }}>
                {t("respScaleHint")}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {labels.map((label, i) => {
                  const value = i + 1;
                  const sel = answers[current.id] === value;
                  return (
                    <button
                      key={value}
                      className={"fl-btn fl-dot" + (sel ? " sel" : "")}
                      style={{ width: "100%", maxWidth: "none", textAlign: "left", padding: "13px 16px" }}
                      onClick={() => answer(value)}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {pos > 0 && (
                <button
                  className="fl-btn"
                  onClick={() => setPos(pos - 1)}
                  style={{ background: "transparent", color: C.muted, fontSize: 12.5, marginTop: 18 }}
                >
                  ← {UI.back[lang]}
                </button>
              )}
            </div>
          )}

          {phase === "thanks" && (
            <div className="fl-rise" style={{ paddingTop: 30 }}>
              <h1 style={{ fontFamily: DISPLAY, fontSize: 34, fontWeight: 400, margin: 0 }}>
                {t("respThanksTitle")}
              </h1>
              <p style={{ fontSize: 15, lineHeight: 1.55, color: C.porcelain, marginTop: 16 }}>
                {t("respThanksBody")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

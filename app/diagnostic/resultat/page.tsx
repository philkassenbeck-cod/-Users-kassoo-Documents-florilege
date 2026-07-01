"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  florilegeData as data,
  computeFlorilege,
  forceLabel,
  familyLabel,
  findForce,
  type Responses,
  type FlorilegeResult,
} from "@core";
import { useLang } from "@/components/LanguageProvider";
import { LangToggle } from "@/components/LangToggle";
import { Sprig } from "@/components/Sprig";
import { C, DISPLAY } from "@/components/theme";
import { tr } from "@/content/ui";
import { forceContent, composeSignature } from "@/content/forces";
import { USE_ALT_COMPASSION_LABEL } from "@/content/config";
import { RESPONSES_KEY } from "../page";

export default function Resultat() {
  const { lang } = useLang();
  const [responses, setResponses] = useState<Responses | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(RESPONSES_KEY);
      if (raw) setResponses(JSON.parse(raw) as Responses);
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  const result: FlorilegeResult | null = useMemo(
    () => (responses ? computeFlorilege(data, responses) : null),
    [responses]
  );

  // Pas de passation en mémoire → invitation à passer le diagnostic.
  if (loaded && !result) {
    return (
      <main className="fl-wrap" style={{ minHeight: "100vh" }}>
        <div style={{ position: "absolute", top: 40, right: 22 }}>
          <LangToggle />
        </div>
        <div style={{ maxWidth: 560, margin: "16vh auto 0", textAlign: "center" }}>
          <h1 style={{ fontFamily: DISPLAY, fontSize: 40, fontWeight: 400 }}>
            {tr("noResultTitle", lang)}
          </h1>
          <p style={{ color: C.muted, marginTop: 14, fontSize: 15.5 }}>{tr("noResultBody", lang)}</p>
          <Link
            href="/diagnostic"
            className="fl-btn fl-reveal"
            style={{ textDecoration: "none", display: "inline-block", marginTop: 26 }}
          >
            {tr("landingCta", lang)}
          </Link>
        </div>
      </main>
    );
  }

  if (!result) return null;

  const notes = tr("notes", lang).split("|");
  const florilegeIds = result.florilege.map((f) => f.forceId);
  const signature = composeSignature(florilegeIds, lang);

  const toggleFlip = (i: number) => setFlipped((f) => ({ ...f, [i]: !f[i] }));

  return (
    <main className="fl-wrap" style={{ minHeight: "100vh" }}>
      <div style={{ position: "absolute", top: 40, right: 22 }}>
        <LangToggle />
      </div>

      {/* En-tête */}
      <div className="fl-hint" style={{ color: C.brass, marginBottom: 20 }}>
        {tr("landingEyebrow", lang)}
      </div>
      <h1
        style={{
          fontFamily: DISPLAY,
          fontSize: "clamp(40px,7vw,74px)",
          lineHeight: 1,
          margin: 0,
          fontWeight: 400,
          letterSpacing: "-0.01em",
        }}
      >
        {tr("landingTitle", lang)}
      </h1>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 18 }}>
        <Sprig color={C.brass} />
        <p style={{ margin: 0, fontSize: 17, color: C.blush, fontStyle: "italic", fontFamily: DISPLAY }}>
          {tr("landingSubtitle", lang)}
        </p>
      </div>

      {!revealed ? (
        <div style={{ textAlign: "center", padding: "70px 0 40px" }}>
          <button className="fl-btn fl-reveal" onClick={() => setRevealed(true)}>
            {tr("reveal", lang)}
          </button>
          <p style={{ color: C.muted, marginTop: 20, fontSize: 14 }}>{tr("revealHint", lang)}</p>
        </div>
      ) : (
        <div style={{ marginTop: 40 }}>
          {/* Les trois notes */}
          <div className="fl-notes">
            {result.florilege.map((f, i) => {
              const force = findForce(data, f.forceId)!;
              const copy = forceContent[f.forceId];
              const origin = data.origin_layer.by_family[f.family]?.reading[lang] ?? "";
              const isFlip = !!flipped[i];
              return (
                <div
                  key={f.forceId}
                  className={"fl-card fl-reveal-anim" + (isFlip ? " flip" : "")}
                  style={{ animationDelay: `${i * 0.18}s` }}
                  onClick={() => toggleFlip(i)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggleFlip(i)}
                >
                  {/* Recto : la force (MESURE) */}
                  <div className="fl-face fl-front">
                    <div className="fl-hint" style={{ color: C.brass }}>
                      {notes[i]}
                    </div>
                    <div style={{ fontFamily: DISPLAY, fontSize: 34, marginTop: 14, fontWeight: 400 }}>
                      {forceLabel(force, lang, USE_ALT_COMPASSION_LABEL)}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        letterSpacing: ".08em",
                        color: C.muted,
                        textTransform: "uppercase",
                        marginTop: 4,
                      }}
                    >
                      {familyLabel(data, f.family, lang)}
                    </div>
                    <p style={{ fontSize: 13, lineHeight: 1.5, color: C.muted, marginTop: 14 }}>
                      {copy?.definition[lang]}
                    </p>
                    <div style={{ margin: "18px 0 0", height: 1, background: C.line }} />
                    <p style={{ fontFamily: DISPLAY, fontSize: 21, lineHeight: 1.3, marginTop: 20, color: C.porcelain }}>
                      « {copy?.phrase[lang]} »
                    </p>
                    <div style={{ marginTop: 18 }}>
                      <span className="fl-hint" style={{ color: C.brass }}>
                        {tr("nuggetLabel", lang)}
                      </span>
                      <p style={{ fontSize: 13.5, lineHeight: 1.5, color: C.muted, marginTop: 6 }}>
                        {copy?.nugget[lang]}
                      </p>
                    </div>
                    <div
                      className="fl-hint"
                      style={{ position: "absolute", bottom: 18, left: 22, color: "rgba(154,147,168,.75)" }}
                    >
                      ↻ {tr("flipHint", lang)}
                    </div>
                  </div>

                  {/* Verso : l'origine (SENS — couche Maté, non scorée) */}
                  <div className="fl-face fl-back">
                    <div className="fl-hint" style={{ color: C.blush }}>
                      {tr("originLabel", lang)}
                    </div>
                    <p
                      style={{
                        fontFamily: DISPLAY,
                        fontSize: 18,
                        lineHeight: 1.45,
                        marginTop: 18,
                        color: C.porcelain,
                        fontStyle: "italic",
                      }}
                    >
                      {origin}
                    </p>
                    <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 10 }}>
                      <Sprig color={C.blush} w={34} />
                      <span className="fl-hint" style={{ color: "rgba(154,147,168,.75)" }}>
                        ↻ {tr("backHint", lang)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Signature composée */}
          <div style={{ textAlign: "center", margin: "46px auto 0", maxWidth: 720 }}>
            <div className="fl-hint" style={{ color: C.brass, marginBottom: 14 }}>
              — {tr("signatureLabel", lang)} —
            </div>
            <p
              style={{
                fontFamily: DISPLAY,
                fontSize: "clamp(24px,4vw,34px)",
                lineHeight: 1.25,
                margin: 0,
                color: C.brassSoft,
              }}
            >
              {signature}
            </p>
          </div>

          {/* Constellation des 8 */}
          <div style={{ marginTop: 54, borderTop: `1px solid ${C.line}`, paddingTop: 30 }}>
            <div className="fl-hint" style={{ marginBottom: 20 }}>
              {tr("constTitle", lang)}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {result.scores.map((s, i) => {
                const force = findForce(data, s.forceId)!;
                const top = florilegeIds.includes(s.forceId);
                return (
                  <div key={s.forceId} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div
                      style={{
                        width: 96,
                        fontSize: 13.5,
                        color: top ? C.porcelain : C.muted,
                        textAlign: "right",
                        flexShrink: 0,
                      }}
                    >
                      {forceLabel(force, lang, USE_ALT_COMPASSION_LABEL)}
                    </div>
                    <div className="fl-track">
                      <div
                        className="fl-bar-fill"
                        style={{
                          width: `${(s.score / 5) * 100}%`,
                          background: top
                            ? `linear-gradient(90deg, ${C.brass}, ${C.brassSoft})`
                            : "rgba(154,147,168,.45)",
                          animationDelay: `${i * 0.06}s`,
                        }}
                      />
                    </div>
                    <div style={{ width: 30, fontSize: 12.5, color: top ? C.brass : C.muted, flexShrink: 0 }}>
                      {s.score.toFixed(1)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Passerelles : 360 + lettre de coaching */}
          <div style={{ textAlign: "center", marginTop: 48, display: "flex", gap: 22, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
            <Link
              href="/360"
              className="fl-btn fl-reveal"
              style={{ textDecoration: "none", display: "inline-block" }}
            >
              {tr("ask360", lang)}
            </Link>
            <Link href="/lettre" style={{ color: C.brass, fontSize: 14 }}>
              {tr("letterCta", lang)} →
            </Link>
          </div>

          {/* Disclaimer d'origine — TOUJOURS affiché (couche SENS) */}
          <p
            style={{
              marginTop: 40,
              fontSize: 12.5,
              lineHeight: 1.6,
              color: "rgba(154,147,168,.8)",
              textAlign: "center",
              maxWidth: 620,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {data.origin_layer.disclaimer[lang]}
          </p>
        </div>
      )}
    </main>
  );
}

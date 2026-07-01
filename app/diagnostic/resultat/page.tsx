"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  florilegeData as data,
  computeFlorilege,
  forceLabel,
  familyLabel,
  findForce,
  type Responses,
} from "@core";
import { useLang } from "@/components/LanguageProvider";
import { LangToggle } from "@/components/LangToggle";
import { Sprig } from "@/components/Sprig";
import { C, DISPLAY } from "@/components/theme";
import { tr } from "@/content/ui";
import { forceContent, composeSignature } from "@/content/forces";
import { USE_ALT_COMPASSION_LABEL } from "@/content/config";
import { RESPONSES_KEY } from "../page";

const SUBJECT_KEY = "florilege_subject";

interface ScoreRow {
  forceId: string;
  family: string;
  score: number;
}

function florilegeFromScores(map: Record<string, number>) {
  const scores: ScoreRow[] = data.forces
    .map((f) => ({ forceId: f.id, family: f.family, score: map[f.id] ?? 0 }))
    .sort((a, b) => b.score - a.score);
  return { scores, florilege: scores.slice(0, data.meta.scoring.florilege_size ?? 3) };
}

function ResultInner() {
  const { lang } = useLang();
  const params = useSearchParams();
  const urlId = params.get("id");

  const [responses, setResponses] = useState<Responses | null>(null);
  const [selfScores, setSelfScores] = useState<Record<string, number> | null>(null);
  const [personId, setPersonId] = useState<string | null>(urlId);
  const [loaded, setLoaded] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});

  // Gate (test frais → prénom + email)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedLink, setSavedLink] = useState<string | null>(null);
  const [emailed, setEmailed] = useState(false);

  useEffect(() => {
    (async () => {
      if (urlId) {
        try {
          const res = await fetch(`/api/subjects?id=${urlId}`);
          if (res.ok) {
            const j = await res.json();
            setSelfScores(j.selfScores ?? {});
            setPersonId(urlId);
            setRevealed(true); // déjà enregistré → pas de gate
          }
        } catch {
          /* ignore */
        }
      } else {
        try {
          const raw = window.sessionStorage.getItem(RESPONSES_KEY);
          if (raw) setResponses(JSON.parse(raw) as Responses);
        } catch {
          /* ignore */
        }
      }
      setLoaded(true);
    })();
  }, [urlId]);

  const model = useMemo(() => {
    if (responses) {
      const r = computeFlorilege(data, responses);
      return { scores: r.scores as ScoreRow[], florilege: r.florilege as ScoreRow[] };
    }
    if (selfScores) return florilegeFromScores(selfScores);
    return null;
  }, [responses, selfScores]);

  async function reveal() {
    if (!model || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/persons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || null,
          lang,
          selfScores: Object.fromEntries(model.scores.map((s) => [s.forceId, s.score])),
        }),
      });
      const j = await res.json();
      setPersonId(j.id);
      setSavedLink(j.link);
      setEmailed(!!j.emailed);
      try {
        window.localStorage.setItem(SUBJECT_KEY, j.id);
      } catch {
        /* ignore */
      }
      setRevealed(true);
    } finally {
      setSaving(false);
    }
  }

  const toggleFlip = (i: number) => setFlipped((f) => ({ ...f, [i]: !f[i] }));

  if (loaded && !model) {
    return (
      <main className="fl-wrap" style={{ minHeight: "100vh" }}>
        <div style={{ position: "absolute", top: 40, right: 22 }}>
          <LangToggle />
        </div>
        <div style={{ maxWidth: 560, margin: "16vh auto 0", textAlign: "center" }}>
          <h1 style={{ fontFamily: DISPLAY, fontSize: 40, fontWeight: 400 }}>{tr("noResultTitle", lang)}</h1>
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
  if (!model) return null;

  const notes = tr("notes", lang).split("|");
  const florilegeIds = model.florilege.map((f) => f.forceId);
  const signature = composeSignature(florilegeIds, lang);
  const canReveal = name.trim().length > 0 && email.includes("@");

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
        // Gate : prénom + email → enregistre + envoie le lien + révèle
        <div style={{ maxWidth: 460, margin: "48px auto 0", textAlign: "center" }}>
          <h2 style={{ fontFamily: DISPLAY, fontSize: 24, fontWeight: 400, margin: 0 }}>{tr("gateTitle", lang)}</h2>
          <p style={{ color: C.muted, fontSize: 14.5, lineHeight: 1.55, marginTop: 12 }}>{tr("gateBody", lang)}</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={tr("gateName", lang)}
            maxLength={60}
            style={inputStyle}
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={tr("gateEmail", lang)}
            type="email"
            maxLength={120}
            style={inputStyle}
          />
          <button
            className="fl-btn fl-reveal"
            onClick={reveal}
            disabled={!canReveal || saving}
            style={{ marginTop: 18, opacity: canReveal && !saving ? 1 : 0.45 }}
          >
            {saving ? tr("gateSending", lang) : tr("reveal", lang)}
          </button>
        </div>
      ) : (
        <div style={{ marginTop: 40 }}>
          {/* Confirmation d'envoi / lien à conserver */}
          {savedLink && (
            <div
              className="fl-rise"
              style={{
                border: "1px solid rgba(201,164,92,.4)",
                borderRadius: 14,
                padding: "14px 18px",
                marginBottom: 30,
                background: "linear-gradient(150deg, rgba(201,164,92,.1), rgba(228,169,143,.05))",
              }}
            >
              {emailed && email ? (
                <div style={{ fontSize: 14, color: C.porcelain }}>
                  ✦ {tr("gateEmailSent", lang)} <strong>{email}</strong>.
                </div>
              ) : null}
              <div style={{ fontSize: 12.5, color: C.muted, marginTop: emailed ? 6 : 0 }}>
                {tr("gateKeepLink", lang)} : <span style={{ color: C.brass, wordBreak: "break-all" }}>{savedLink}</span>
              </div>
            </div>
          )}

          {/* Les trois notes */}
          <div className="fl-notes">
            {model.florilege.map((f, i) => {
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
                  <div className="fl-face fl-front">
                    <div className="fl-hint" style={{ color: C.brass }}>
                      {notes[i]}
                    </div>
                    <div style={{ fontFamily: DISPLAY, fontSize: 34, marginTop: 14, fontWeight: 400 }}>
                      {forceLabel(force, lang, USE_ALT_COMPASSION_LABEL)}
                    </div>
                    <div style={{ fontSize: 12, letterSpacing: ".08em", color: C.muted, textTransform: "uppercase", marginTop: 4 }}>
                      {familyLabel(data, f.family, lang)}
                    </div>
                    <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "rgba(243,236,225,.82)", marginTop: 14 }}>
                      {copy?.description[lang]}
                    </p>
                    <div style={{ margin: "18px 0 0", height: 1, background: C.line }} />
                    <p style={{ fontFamily: DISPLAY, fontSize: 21, lineHeight: 1.3, marginTop: 20, color: C.porcelain }}>
                      « {copy?.phrase[lang]} »
                    </p>
                    <div style={{ marginTop: 18 }}>
                      <span className="fl-hint" style={{ color: C.brass }}>
                        {tr("nuggetLabel", lang)}
                      </span>
                      <p style={{ fontSize: 13.5, lineHeight: 1.5, color: C.muted, marginTop: 6 }}>{copy?.nugget[lang]}</p>
                    </div>
                    <div className="fl-hint" style={{ position: "absolute", bottom: 18, left: 22, color: "rgba(154,147,168,.75)" }}>
                      ↻ {tr("flipHint", lang)}
                    </div>
                  </div>

                  <div className="fl-face fl-back">
                    <div className="fl-hint" style={{ color: C.blush }}>
                      {tr("originLabel", lang)}
                    </div>
                    <p style={{ fontFamily: DISPLAY, fontSize: 18, lineHeight: 1.45, marginTop: 18, color: C.porcelain, fontStyle: "italic" }}>
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
            <p style={{ fontFamily: DISPLAY, fontSize: "clamp(24px,4vw,34px)", lineHeight: 1.25, margin: 0, color: C.brassSoft }}>
              {signature}
            </p>
          </div>

          {/* Constellation des 8 */}
          <div style={{ marginTop: 54, borderTop: `1px solid ${C.line}`, paddingTop: 30 }}>
            <div className="fl-hint" style={{ marginBottom: 20 }}>
              {tr("constTitle", lang)}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {model.scores.map((s, i) => {
                const force = findForce(data, s.forceId)!;
                const copy = forceContent[s.forceId];
                const top = florilegeIds.includes(s.forceId);
                return (
                  <div key={s.forceId}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                      <span style={{ fontFamily: DISPLAY, fontSize: 17, color: top ? C.porcelain : C.muted }}>
                        {forceLabel(force, lang, USE_ALT_COMPASSION_LABEL)}
                      </span>
                      <span style={{ fontSize: 12.5, color: top ? C.brass : C.muted, flexShrink: 0 }}>{s.score.toFixed(1)}</span>
                    </div>
                    <div className="fl-track" style={{ marginTop: 7 }}>
                      <div
                        className="fl-bar-fill"
                        style={{
                          width: `${(s.score / 5) * 100}%`,
                          background: top ? `linear-gradient(90deg, ${C.brass}, ${C.brassSoft})` : "rgba(154,147,168,.45)",
                          animationDelay: `${i * 0.06}s`,
                        }}
                      />
                    </div>
                    <p style={{ fontSize: 12.5, lineHeight: 1.45, color: C.muted, marginTop: 7 }}>{copy?.definition[lang]}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Passerelles : 360 + lettre */}
          <div style={{ textAlign: "center", marginTop: 48, display: "flex", gap: 22, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
            <Link
              href={personId ? `/360?id=${personId}` : "/360"}
              className="fl-btn fl-reveal"
              style={{ textDecoration: "none", display: "inline-block" }}
            >
              {tr("ask360", lang)}
            </Link>
            <Link href={personId ? `/lettre?id=${personId}` : "/lettre"} style={{ color: C.brass, fontSize: 14 }}>
              {tr("letterCta", lang)} →
            </Link>
          </div>

          {/* Disclaimer d'origine — TOUJOURS affiché */}
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

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 12,
  padding: "12px 16px",
  borderRadius: 12,
  border: `1px solid ${C.line}`,
  background: C.panel,
  color: C.porcelain,
  fontSize: 16,
  fontFamily: DISPLAY,
};

export default function Resultat() {
  return (
    <Suspense fallback={null}>
      <ResultInner />
    </Suspense>
  );
}

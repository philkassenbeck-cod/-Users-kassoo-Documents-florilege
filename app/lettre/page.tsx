"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  florilegeData as data,
  computeFlorilege,
  computeGaps,
  extractPepites,
  highPhrase,
  johariLine,
  forceLabel,
  familyLabel,
  findForce,
  type Lang,
  type ObserverResponse,
  type Responses,
} from "@core";
import { useLang } from "@/components/LanguageProvider";
import { Sprig } from "@/components/Sprig";
import { UI } from "@/content/ui";
import { forceContent, composeSignature } from "@/content/forces";
import { USE_ALT_COMPASSION_LABEL } from "@/content/config";
import { RESPONSES_KEY } from "../diagnostic/page";

const SUBJECT_KEY = "florilege_subject";
const INK = "#1A1A28";
const BRASS = "#9A7A34"; // laiton assombri pour lisibilité sur papier crème
const MUTED = "rgba(26,26,40,0.62)";

interface ScoreRow {
  forceId: string;
  family: string;
  score: number;
}
interface SubjectView {
  name: string;
  lang: Lang;
  selfScores: Record<string, number>;
  responses: ObserverResponse[];
}

function florilegeFromScores(map: Record<string, number>) {
  const scores: ScoreRow[] = data.forces
    .map((f) => ({ forceId: f.id, family: f.family, score: map[f.id] ?? 0 }))
    .sort((a, b) => b.score - a.score);
  return { scores, florilege: scores.slice(0, data.meta.scoring.florilege_size ?? 3) };
}

function LetterInner() {
  const { lang } = useLang();
  const params = useSearchParams();
  const [responses, setResponses] = useState<Responses | null>(null);
  const [view, setView] = useState<SubjectView | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let sessionResponses: Responses | null = null;
    try {
      const raw = window.sessionStorage.getItem(RESPONSES_KEY);
      if (raw) sessionResponses = JSON.parse(raw) as Responses;
      setResponses(sessionResponses);
    } catch {
      /* ignore */
    }
    const id = params.get("id") || (typeof window !== "undefined" ? window.localStorage.getItem(SUBJECT_KEY) : null);
    (async () => {
      if (id) {
        try {
          const res = await fetch(`/api/subjects?id=${id}`);
          if (res.ok) setView((await res.json()) as SubjectView);
        } catch {
          /* ignore */
        }
      }
      setLoaded(true);
    })();
  }, [params]);

  // Couche MESURE : florilège depuis la passation self, sinon depuis le 360.
  const model = useMemo(() => {
    if (responses) {
      const r = computeFlorilege(data, responses);
      return { scores: r.scores as ScoreRow[], florilege: r.florilege as ScoreRow[] };
    }
    if (view) return florilegeFromScores(view.selfScores);
    return null;
  }, [responses, view]);

  // Couche REGARD DES AUTRES : seulement si au-dessus du seuil d'anonymat.
  const others = useMemo(() => {
    if (!view) return null;
    const minN = data.three_sixty.anonymity.min_respondents_per_circle;
    if (view.responses.length < minN) return null;
    const gaps = computeGaps(data, view.selfScores, view.responses);
    return { pepites: extractPepites(data, gaps), gaps, n: view.responses.length };
  }, [view]);

  if (loaded && !model) {
    return (
      <div className="letter-stage">
        <div className="letter-paper" style={{ textAlign: "center" }}>
          <p className="letter-serif" style={{ fontSize: 22 }}>
            {UI.letterNeedSelf[lang]}
          </p>
          <Link href="/diagnostic" className="fl-btn fl-reveal no-print" style={{ textDecoration: "none", display: "inline-block", marginTop: 20 }}>
            {UI.landingCta[lang]}
          </Link>
        </div>
      </div>
    );
  }
  if (!model) return null;

  const lab = (id: string) => {
    const f = findForce(data, id);
    return f ? forceLabel(f, lang, USE_ALT_COMPASSION_LABEL) : id;
  };
  const florilegeIds = model.florilege.map((f) => f.forceId);
  const signature = composeSignature(florilegeIds, lang);
  const name = view?.name ?? "";

  // Familles distinctes du florilège pour la couche origine.
  const families = [...new Set(model.florilege.map((f) => f.family))];

  return (
    <div className="letter-stage">
      <div className="letter-paper">
        {/* Barre d'action — masquée à l'impression */}
        <div className="no-print" style={{ display: "flex", justifyContent: "space-between", marginBottom: 30 }}>
          <Link href="/diagnostic/resultat" style={{ color: BRASS, fontSize: 13, textDecoration: "none" }}>
            ← {UI.landingTitle[lang]}
          </Link>
          <button className="fl-btn" onClick={() => window.print()} style={{ background: INK, color: "#F3ECE1", padding: "9px 18px", borderRadius: 999, fontSize: 13, fontWeight: 600 }}>
            {UI.letterPrint[lang]}
          </button>
        </div>

        {/* En-tête */}
        <div className="letter-eyebrow">{UI.letterEyebrow[lang]}</div>
        <h1 style={{ fontSize: 46, fontWeight: 400, margin: "16px 0 0", lineHeight: 1.02 }}>{UI.landingTitle[lang]}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
          <Sprig color={BRASS} />
          <span className="letter-serif" style={{ fontStyle: "italic", color: BRASS, fontSize: 16 }}>
            {UI.landingSubtitle[lang]}
          </span>
        </div>

        {/* Ouverture */}
        <p style={{ marginTop: 30, fontSize: 15.5, lineHeight: 1.65 }}>
          {UI.letterGreeting[lang]}
          {name ? ` ${name}` : ""},
        </p>
        <p style={{ marginTop: 12, fontSize: 15.5, lineHeight: 1.65 }}>{UI.letterOpen[lang]}</p>

        {/* MESURE — les trois notes */}
        <div className="letter-rule" />
        <div className="letter-eyebrow">{UI.letterNotesTitle[lang]}</div>
        {model.florilege.map((f, i) => {
          const copy = forceContent[f.forceId];
          const notes = UI.notes[lang].split("|");
          return (
            <div key={f.forceId} style={{ marginTop: 22 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                <span style={{ color: BRASS, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase" }}>{notes[i]}</span>
                <span className="letter-serif" style={{ fontSize: 26 }}>{lab(f.forceId)}</span>
                <span style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: MUTED }}>
                  {familyLabel(data, f.family, lang)}
                </span>
              </div>
              <p style={{ fontSize: 13.5, lineHeight: 1.55, marginTop: 6, color: MUTED }}>{copy?.definition[lang]}</p>
              <p className="letter-serif" style={{ fontSize: 18, lineHeight: 1.4, marginTop: 8 }}>« {copy?.phrase[lang]} »</p>
              <p style={{ fontSize: 14, lineHeight: 1.6, marginTop: 6, color: "rgba(26,26,40,0.78)" }}>
                <strong style={{ color: BRASS, fontWeight: 600 }}>{UI.letterTeam[lang]} · </strong>
                {copy?.nugget[lang]}
              </p>
            </div>
          );
        })}

        {/* REGARD DES AUTRES — seulement au-dessus du seuil */}
        {others && (
          <>
            <div className="letter-rule" />
            <div className="letter-eyebrow">{UI.letter360Title[lang]}</div>
            {others.pepites.slice(0, 2).map((g) => (
              <p key={g.forceId} style={{ marginTop: 16, fontSize: 15, lineHeight: 1.6 }}>
                <strong className="letter-serif" style={{ fontSize: 17 }}>{lab(g.forceId)}. </strong>
                {highPhrase(data, g, lab(g.forceId), lang)} {johariLine(data, g, lab(g.forceId), lang)}
              </p>
            ))}
            {others.pepites.length === 0 &&
              (() => {
                const top = others.gaps
                  .filter((g) => g.other !== null)
                  .sort((a, b) => Math.abs(b.delta ?? 0) - Math.abs(a.delta ?? 0))[0];
                if (!top) return null;
                return (
                  <p style={{ marginTop: 16, fontSize: 15, lineHeight: 1.6, color: MUTED }}>
                    {johariLine(data, top, lab(top.forceId), lang)}
                  </p>
                );
              })()}
          </>
        )}

        {/* SENS — l'origine (couche Maté, non scorée) */}
        <div className="letter-rule" />
        <div className="letter-eyebrow">{UI.letterOriginTitle[lang]}</div>
        {families.map((fam) => {
          const o = data.origin_layer.by_family[fam];
          if (!o) return null;
          return (
            <div key={fam} style={{ marginTop: 18 }}>
              <div style={{ fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", color: BRASS }}>
                {familyLabel(data, fam, lang)}
              </div>
              <p className="letter-serif" style={{ fontStyle: "italic", fontSize: 15.5, lineHeight: 1.55, marginTop: 6 }}>
                {o.reading[lang]}
              </p>
              <p style={{ fontSize: 13.5, color: MUTED, marginTop: 6 }}>
                <em>{UI.letterOriginQuestion[lang]} :</em> {o.prompt[lang]}
              </p>
            </div>
          );
        })}
        <p style={{ fontSize: 12.5, lineHeight: 1.6, color: MUTED, marginTop: 22, fontStyle: "italic" }}>
          {data.origin_layer.disclaimer[lang]}
        </p>

        {/* Signature + clôture */}
        <div className="letter-rule" />
        <div className="letter-eyebrow">{UI.letterSignatureTitle[lang]}</div>
        <p className="letter-serif" style={{ fontSize: 26, lineHeight: 1.25, marginTop: 12, color: INK }}>{signature}</p>
        <p style={{ fontSize: 14.5, lineHeight: 1.6, marginTop: 22, color: "rgba(26,26,40,0.8)" }}>{UI.letterClose[lang]}</p>
        <div style={{ marginTop: 20 }}>
          <Sprig color={BRASS} w={60} />
        </div>
      </div>
    </div>
  );
}

export default function LetterPage() {
  return (
    <Suspense fallback={null}>
      <LetterInner />
    </Suspense>
  );
}

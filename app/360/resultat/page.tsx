"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  florilegeData as data,
  computeGaps,
  byCircle,
  extractPepites,
  highPhrase,
  johariLine,
  forceLabel,
  familyLabel,
  findForce,
  type Lang,
  type ObserverResponse,
  type ForceGap,
} from "@core";
import { LangToggle } from "@/components/LangToggle";
import { C, DISPLAY, QUAD } from "@/components/theme";
import { UI } from "@/content/ui";
import { USE_ALT_COMPASSION_LABEL } from "@/content/config";

interface SubjectView {
  name: string;
  lang: Lang;
  selfScores: Record<string, number>;
  responses: ObserverResponse[];
}

function label(forceId: string, lang: Lang) {
  const f = findForce(data, forceId);
  return f ? forceLabel(f, lang, USE_ALT_COMPASSION_LABEL) : forceId;
}

function Bar({ value, color, name, val }: { value: number; color: string; name: string; val: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 7 }}>
      <div style={{ width: 52, fontSize: 11, color: C.muted, textAlign: "right", flexShrink: 0, letterSpacing: ".04em" }}>
        {name}
      </div>
      <div className="fl-track" style={{ height: 8 }}>
        <div className="fl-bar-fill" style={{ width: `${(value / 5) * 100}%`, background: color }} />
      </div>
      <div style={{ width: 26, fontSize: 12, color, flexShrink: 0, fontWeight: 600 }}>{val}</div>
    </div>
  );
}

function Debrief360Inner() {
  const params = useSearchParams();
  const id = params.get("id");
  const [view, setView] = useState<SubjectView | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [circle, setCircle] = useState<string>("all");

  useEffect(() => {
    if (!id) {
      setState("error");
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/subjects?id=${id}`);
        if (!res.ok) {
          setState("error");
          return;
        }
        setView((await res.json()) as SubjectView);
        setState("ready");
      } catch {
        setState("error");
      }
    })();
  }, [id]);

  const lang: Lang = view?.lang ?? "fr";
  const t = (k: keyof typeof UI) => UI[k]?.[lang] ?? String(k);
  const minN = data.three_sixty.anonymity.min_respondents_per_circle;

  const circleViews = useMemo(
    () => (view ? byCircle(data, view.selfScores, view.responses) : []),
    [view]
  );
  const allN = view?.responses.length ?? 0;
  const allVisible = allN >= minN;

  const gaps = useMemo(() => {
    if (!view) return [] as ForceGap[];
    return circle === "all"
      ? computeGaps(data, view.selfScores, view.responses)
      : computeGaps(data, view.selfScores, view.responses, circle);
  }, [view, circle]);

  if (state === "loading") {
    return (
      <div className="fl-phone-stage">
        <div className="fl-phone">
          <div className="fl-scroll">
            <p style={{ color: C.muted }}>…</p>
          </div>
        </div>
      </div>
    );
  }

  if (state === "error" || !view) {
    return (
      <div className="fl-phone-stage">
        <div className="fl-phone">
          <div className="fl-scroll">
            <p style={{ fontFamily: DISPLAY, fontSize: 20, color: C.porcelain, marginTop: 20 }}>
              {t("respInvalid")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const activeN = circle === "all" ? allN : circleViews.find((c) => c.circleId === circle)?.n ?? 0;
  const circleLabelActive =
    circle === "all"
      ? t("dbAll")
      : data.three_sixty.circles.find((c) => c.id === circle)?.label[lang] ?? "";

  // Notes affichées : forces avec un « autres » calculable, triées par écart absolu.
  const notes = gaps
    .filter((g) => g.other !== null)
    .sort((a, b) => Math.abs(b.delta ?? 0) - Math.abs(a.delta ?? 0))
    .slice(0, 4);

  const pepites = extractPepites(data, gaps);
  const hero = pepites[0];
  const nothingToShow = notes.length === 0;

  return (
    <div className="fl-phone-stage">
      <div className="fl-phone">
        <div className="fl-scroll">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <span style={{ fontSize: 11, letterSpacing: ".16em", color: C.brass }}>{UI.invEyebrow[lang]}</span>
            <LangToggle />
          </div>

          <h1 style={{ fontFamily: DISPLAY, fontSize: 34, lineHeight: 1.05, margin: 0, fontWeight: 400 }}>
            {t("invTitle")}
          </h1>
          <p style={{ fontFamily: DISPLAY, fontStyle: "italic", color: C.blush, fontSize: 15, marginTop: 10, marginBottom: 20 }}>
            {view.name}
          </p>

          {/* Sélecteur de cercle — verrouillé sous le seuil d'anonymat */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <button
              className={"fl-btn fl-chip" + (circle === "all" ? " on" : "") + (allVisible ? "" : " lock")}
              onClick={() => allVisible && setCircle("all")}
            >
              {t("dbAll")}
            </button>
            {data.three_sixty.circles.map((c) => {
              const cv = circleViews.find((x) => x.circleId === c.id);
              const visible = !!cv?.visible;
              return (
                <button
                  key={c.id}
                  className={"fl-btn fl-chip" + (circle === c.id ? " on" : "") + (visible ? "" : " lock")}
                  onClick={() => visible && setCircle(c.id)}
                  title={visible ? "" : t("dbLocked")}
                >
                  {c.label[lang]}
                  {visible ? "" : " · 🔒"}
                </button>
              );
            })}
          </div>
          <div style={{ fontSize: 11.5, color: C.muted, marginTop: 9, letterSpacing: ".03em" }}>
            {activeN} {t("dbResp")}
          </div>

          {nothingToShow ? (
            <p style={{ fontFamily: DISPLAY, fontStyle: "italic", color: C.porcelain, fontSize: 16, marginTop: 30, lineHeight: 1.5 }}>
              {t("dbWaiting")}
            </p>
          ) : (
            <>
              {/* Pépite — carte héros */}
              {hero && (
                <div
                  className="fl-rise"
                  style={{
                    marginTop: 20,
                    borderRadius: 16,
                    padding: "18px 18px 16px",
                    background: "linear-gradient(150deg, rgba(228,169,143,.16), rgba(201,164,92,.08))",
                    border: "1px solid rgba(228,169,143,.4)",
                  }}
                >
                  <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: C.blush }}>
                    ✦ {t("dbPepiteTitle")}
                  </div>
                  <div style={{ fontFamily: DISPLAY, fontSize: 30, marginTop: 10, color: C.porcelain }}>
                    {label(hero.forceId, lang)}
                  </div>
                  <p style={{ fontSize: 14.5, color: C.porcelain, marginTop: 8, lineHeight: 1.45 }}>
                    {highPhrase(data, hero, label(hero.forceId, lang), lang, circle === "all" ? undefined : circleLabelActive)}
                  </p>
                  <p style={{ fontSize: 12.5, color: C.blush, marginTop: 4 }}>
                    {lang === "fr" ? "+" : "+"}
                    {(hero.delta ?? 0).toFixed(1)} {lang === "fr" ? "d'écart avec votre propre regard." : "above your own view."}
                  </p>
                </div>
              )}

              {/* Les notes : comparaison soi / autres */}
              {notes.map((g, i) => {
                const q = QUAD[(g.quadrant ?? "dormant") as keyof typeof QUAD];
                const quadLabel = g.quadrant
                  ? data.three_sixty.johari.quadrants[g.quadrant].label[lang]
                  : "";
                return (
                  <div key={g.forceId} className="fl-note fl-rise" style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontFamily: DISPLAY, fontSize: 24 }}>{label(g.forceId, lang)}</div>
                        <div style={{ fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: C.muted, marginTop: 2 }}>
                          {familyLabel(data, g.family, lang)}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          letterSpacing: ".03em",
                          color: C.ink,
                          background: q.color,
                          padding: "4px 11px",
                          borderRadius: 999,
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {quadLabel}
                      </span>
                    </div>
                    <Bar value={g.self} color={C.muted} name={t("dbYou")} val={g.self.toFixed(1)} />
                    <Bar
                      value={g.other ?? 0}
                      color={q.color}
                      name={circle === "all" ? t("dbOthers") : circleLabelActive}
                      val={(g.other ?? 0).toFixed(1)}
                    />
                    <p style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: 15, color: C.porcelain, marginTop: 13, marginBottom: 2, lineHeight: 1.4 }}>
                      {johariLine(data, g, label(g.forceId, lang), lang)}
                    </p>
                  </div>
                );
              })}
            </>
          )}

          <p style={{ fontSize: 12, color: C.muted, textAlign: "center", marginTop: 24, lineHeight: 1.6, fontStyle: "italic", fontFamily: DISPLAY }}>
            {t("dbFooter")}
          </p>

          {id && (
            <div style={{ textAlign: "center", marginTop: 18 }}>
              <Link href={`/lettre?id=${id}`} style={{ color: C.brass, fontSize: 13 }}>
                {t("letterCta")} →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Debrief360Page() {
  return (
    <Suspense fallback={null}>
      <Debrief360Inner />
    </Suspense>
  );
}

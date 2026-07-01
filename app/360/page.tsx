"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  florilegeData as data,
  computeFlorilege,
  type Responses,
} from "@core";
import { useLang } from "@/components/LanguageProvider";
import { LangToggle } from "@/components/LangToggle";
import { Sprig } from "@/components/Sprig";
import { C, DISPLAY } from "@/components/theme";
import { tr } from "@/content/ui";
import { RESPONSES_KEY } from "../diagnostic/page";

const SUBJECT_KEY = "florilege_subject";

interface GenResult {
  subjectId: string;
  invitations: { token: string; circle: string }[];
}

export default function Invitation() {
  const { lang } = useLang();
  const [responses, setResponses] = useState<Responses | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState("");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [result, setResult] = useState<GenResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [savedSubject, setSavedSubject] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(RESPONSES_KEY);
      if (raw) setResponses(JSON.parse(raw) as Responses);
      setSavedSubject(window.localStorage.getItem(SUBJECT_KEY));
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  const selfScores = useMemo(() => {
    if (!responses) return null;
    const res = computeFlorilege(data, responses);
    return Object.fromEntries(res.scores.map((s) => [s.forceId, s.score]));
  }, [responses]);

  const circles = data.three_sixty.circles;
  const totalLinks = Object.values(counts).reduce((a, b) => a + b, 0);
  const canGenerate = name.trim().length > 0 && totalLinks > 0 && !!selfScores;

  function setCount(circle: string, n: number) {
    setCounts((c) => ({ ...c, [circle]: Math.max(0, Math.min(20, n)) }));
  }

  async function generate() {
    if (!canGenerate || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          pronoun: data.three_sixty.subject_pronoun.default,
          lang,
          selfScores,
          circles: circles.map((c) => ({ circle: c.id, count: counts[c.id] ?? 0 })),
        }),
      });
      const json = (await res.json()) as GenResult;
      setResult(json);
      window.localStorage.setItem(SUBJECT_KEY, json.subjectId);
      setSavedSubject(json.subjectId);
    } finally {
      setBusy(false);
    }
  }

  async function deleteAll(id: string) {
    if (!window.confirm(tr("invDeleteConfirm", lang))) return;
    await fetch(`/api/subjects?id=${id}`, { method: "DELETE" });
    window.localStorage.removeItem(SUBJECT_KEY);
    setSavedSubject(null);
    setResult(null);
    setCounts({});
  }

  function linkFor(token: string) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/r/${token}`;
  }

  async function copy(token: string) {
    try {
      await navigator.clipboard.writeText(linkFor(token));
      setCopied(token);
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard indisponible */
    }
  }

  return (
    <main className="fl-wrap" style={{ minHeight: "100vh", maxWidth: 760 }}>
      <div style={{ position: "absolute", top: 40, right: 22 }}>
        <LangToggle />
      </div>

      <div className="fl-hint" style={{ color: C.brass, marginBottom: 20 }}>
        {tr("invEyebrow", lang)}
      </div>
      <h1
        style={{
          fontFamily: DISPLAY,
          fontSize: "clamp(38px,6.5vw,64px)",
          lineHeight: 1.02,
          margin: 0,
          fontWeight: 400,
        }}
      >
        {tr("invTitle", lang)}
      </h1>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 16 }}>
        <Sprig color={C.brass} />
        <p style={{ margin: 0, fontSize: 16, color: C.blush, fontStyle: "italic", fontFamily: DISPLAY }}>
          {tr("invSubtitle", lang)}
        </p>
      </div>

      {/* Pas de passation self → on invite d'abord à la faire */}
      {loaded && !selfScores ? (
        <div style={{ marginTop: 40 }}>
          <p style={{ color: C.muted, fontSize: 15.5, lineHeight: 1.6 }}>{tr("invNeedSelf", lang)}</p>
          <Link
            href="/diagnostic"
            className="fl-btn fl-reveal"
            style={{ textDecoration: "none", display: "inline-block", marginTop: 18 }}
          >
            {tr("landingCta", lang)}
          </Link>
        </div>
      ) : !result ? (
        <div style={{ marginTop: 40 }}>
          {/* Prénom */}
          <label className="fl-hint" style={{ color: C.brass }}>
            {tr("invNameLabel", lang)}
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={tr("invNamePlaceholder", lang)}
            maxLength={60}
            style={{
              display: "block",
              width: "100%",
              maxWidth: 320,
              marginTop: 10,
              padding: "12px 16px",
              borderRadius: 12,
              border: `1px solid ${C.line}`,
              background: C.panel,
              color: C.porcelain,
              fontSize: 16,
              fontFamily: DISPLAY,
            }}
          />

          {/* Cercles */}
          <div className="fl-hint" style={{ color: C.brass, marginTop: 30 }}>
            {tr("invCirclesLabel", lang)}
          </div>
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
            {circles.map((c) => (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 14,
                  padding: "12px 16px",
                  borderRadius: 14,
                  border: `1px solid ${C.line}`,
                  background: "linear-gradient(165deg, var(--ink2), var(--panel))",
                }}
              >
                <div style={{ fontSize: 15.5, color: C.porcelain }}>{c.label[lang]}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button
                    className="fl-btn fl-dot"
                    style={{ minWidth: 40, padding: "6px 12px" }}
                    onClick={() => setCount(c.id, (counts[c.id] ?? 0) - 1)}
                  >
                    −
                  </button>
                  <span style={{ minWidth: 22, textAlign: "center", fontSize: 16, color: C.brass }}>
                    {counts[c.id] ?? 0}
                  </span>
                  <button
                    className="fl-btn fl-dot"
                    style={{ minWidth: 40, padding: "6px 12px" }}
                    onClick={() => setCount(c.id, (counts[c.id] ?? 0) + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="fl-hint" style={{ textTransform: "none", letterSpacing: 0, marginTop: 14 }}>
            {tr("invThreshold", lang)}
          </p>

          <button
            className="fl-btn fl-reveal"
            onClick={generate}
            disabled={!canGenerate || busy}
            style={{ marginTop: 26, opacity: canGenerate && !busy ? 1 : 0.45 }}
          >
            {tr("invGenerate", lang)} {totalLinks > 0 ? `· ${totalLinks}` : ""}
          </button>

          {savedSubject && (
            <div style={{ marginTop: 22 }}>
              <Link href={`/360/resultat?id=${savedSubject}`} style={{ color: C.brass, fontSize: 14 }}>
                {tr("invSeeResult", lang)} →
              </Link>
            </div>
          )}
        </div>
      ) : (
        // Liens générés
        <div style={{ marginTop: 40 }}>
          <div className="fl-hint" style={{ color: C.brass }}>
            {tr("invLinksTitle", lang)}
          </div>
          <p className="fl-hint" style={{ textTransform: "none", letterSpacing: 0, marginTop: 8 }}>
            {tr("invLinksHint", lang)}
          </p>
          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
            {result.invitations.map((inv, i) => {
              const circle = circles.find((c) => c.id === inv.circle);
              return (
                <div
                  key={inv.token}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "12px 16px",
                    borderRadius: 12,
                    border: `1px solid ${C.line}`,
                    background: C.panel,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div className="fl-hint" style={{ color: C.muted }}>
                      {circle?.label[lang]} · {i + 1}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: C.porcelain,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 380,
                      }}
                    >
                      {linkFor(inv.token)}
                    </div>
                  </div>
                  <button
                    className="fl-btn fl-chip"
                    onClick={() => copy(inv.token)}
                    style={{ flexShrink: 0 }}
                  >
                    {copied === inv.token ? tr("invCopied", lang) : tr("invCopy", lang)}
                  </button>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 18, alignItems: "center", marginTop: 30, flexWrap: "wrap" }}>
            <Link
              href={`/360/resultat?id=${result.subjectId}`}
              className="fl-btn fl-reveal"
              style={{ textDecoration: "none", display: "inline-block" }}
            >
              {tr("invSeeResult", lang)}
            </Link>
            <button
              className="fl-btn"
              onClick={() => deleteAll(result.subjectId)}
              style={{ background: "transparent", color: C.muted, fontSize: 13, letterSpacing: ".04em" }}
            >
              {tr("invDeleteAll", lang)}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

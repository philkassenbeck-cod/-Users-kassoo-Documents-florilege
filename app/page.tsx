"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { LangToggle } from "@/components/LangToggle";
import { Sprig } from "@/components/Sprig";
import { C, DISPLAY } from "@/components/theme";
import { tr } from "@/content/ui";

export default function Landing() {
  const { lang } = useLang();

  return (
    <main className="fl-wrap" style={{ minHeight: "100vh" }}>
      <div style={{ position: "absolute", top: 40, right: 22 }}>
        <LangToggle />
      </div>

      <div style={{ maxWidth: 720, margin: "8vh auto 0" }}>
        <div className="fl-hint" style={{ color: C.brass, marginBottom: 22 }}>
          {tr("landingEyebrow", lang)}
        </div>
        <h1
          style={{
            fontFamily: DISPLAY,
            fontSize: "clamp(44px,8vw,86px)",
            lineHeight: 1,
            margin: 0,
            fontWeight: 400,
            letterSpacing: "-0.01em",
          }}
        >
          {tr("landingTitle", lang)}
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 20 }}>
          <Sprig color={C.brass} />
          <p
            style={{
              margin: 0,
              fontSize: 18,
              color: C.blush,
              fontStyle: "italic",
              fontFamily: DISPLAY,
            }}
          >
            {tr("landingSubtitle", lang)}
          </p>
        </div>

        <p style={{ marginTop: 34, fontSize: 16.5, lineHeight: 1.6, color: C.porcelain, maxWidth: 600 }}>
          {tr("landingBody", lang)}
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 40, flexWrap: "wrap" }}>
          <Link href="/diagnostic" className="fl-btn fl-reveal" style={{ textDecoration: "none" }}>
            {tr("landingCta", lang)}
          </Link>
          <span className="fl-hint">{tr("landingMinutes", lang)}</span>
        </div>
        <div style={{ marginTop: 22 }}>
          <Link href="/login" style={{ color: C.brass, fontSize: 14 }}>
            {tr("loginCta", lang)} →
          </Link>
        </div>
      </div>
    </main>
  );
}

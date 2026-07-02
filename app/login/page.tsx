"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-browser";
import { useLang } from "@/components/LanguageProvider";
import { LangToggle } from "@/components/LangToggle";
import { Sprig } from "@/components/Sprig";
import { C, DISPLAY } from "@/components/theme";
import { tr } from "@/content/ui";

export default function Login() {
  const { lang } = useLang();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/moi` },
    });
    if (error) setError(error.message);
    else setSent(true);
    setLoading(false);
  }

  return (
    <main className="fl-wrap" style={{ minHeight: "100vh", maxWidth: 460 }}>
      <div style={{ position: "absolute", top: 40, right: 22 }}>
        <LangToggle />
      </div>

      <div style={{ marginTop: "16vh", textAlign: "center" }}>
        <div className="fl-hint" style={{ color: C.brass, marginBottom: 18 }}>
          {tr("brand", lang)}
        </div>

        {sent ? (
          <>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
              <Sprig color={C.brass} w={60} />
            </div>
            <h1 style={{ fontFamily: DISPLAY, fontSize: 34, fontWeight: 400, margin: 0 }}>
              {tr("loginSentTitle", lang)}
            </h1>
            <p style={{ color: C.porcelain, fontSize: 15.5, marginTop: 16 }}>
              {tr("loginSentBody", lang)} <strong>{email}</strong>
            </p>
            <p style={{ color: C.muted, fontSize: 13.5, marginTop: 10 }}>{tr("loginSentHint", lang)}</p>
          </>
        ) : (
          <>
            <h1 style={{ fontFamily: DISPLAY, fontSize: "clamp(34px,6vw,52px)", fontWeight: 400, margin: 0 }}>
              {tr("loginTitle", lang)}
            </h1>
            <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.6, marginTop: 14 }}>
              {tr("loginSubtitle", lang)}
            </p>
            <form onSubmit={handleLogin} style={{ marginTop: 24 }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                required
                style={{
                  display: "block",
                  width: "100%",
                  padding: "13px 16px",
                  borderRadius: 12,
                  border: `1px solid ${C.line}`,
                  background: C.panel,
                  color: C.porcelain,
                  fontSize: 16,
                  fontFamily: DISPLAY,
                  textAlign: "center",
                }}
              />
              {error && <p style={{ color: C.blush, fontSize: 13, marginTop: 12 }}>{error}</p>}
              <button
                type="submit"
                className="fl-btn fl-reveal"
                disabled={loading || !email.includes("@")}
                style={{ marginTop: 18, width: "100%", opacity: loading || !email.includes("@") ? 0.5 : 1 }}
              >
                {loading ? tr("loginSending", lang) : tr("loginSend", lang)}
              </button>
            </form>
          </>
        )}

        <div style={{ marginTop: 28 }}>
          <Link href="/" style={{ color: C.muted, fontSize: 13.5 }}>
            {tr("backHome", lang)}
          </Link>
        </div>
      </div>
    </main>
  );
}

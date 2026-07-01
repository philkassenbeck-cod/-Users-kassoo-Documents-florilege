"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { LangToggle } from "@/components/LangToggle";
import { C, DISPLAY } from "@/components/theme";
import { tr } from "@/content/ui";

const PW_KEY = "florilege_admin_pw";

interface SubjectSummary {
  id: string;
  name: string;
  email: string | null;
  lang: string;
  createdAt: number;
  invitationCount: number;
  responseCount: number;
}

export default function Admin() {
  const { lang } = useLang();
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState(false);
  const [subjects, setSubjects] = useState<SubjectSummary[]>([]);
  const [busy, setBusy] = useState(false);

  async function load(password: string): Promise<boolean> {
    setBusy(true);
    setError(false);
    try {
      const res = await fetch("/api/admin/subjects", { headers: { "x-admin-password": password } });
      if (!res.ok) {
        setError(true);
        return false;
      }
      const j = await res.json();
      setSubjects(j.subjects ?? []);
      setAuthed(true);
      return true;
    } catch {
      setError(true);
      return false;
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.sessionStorage.getItem(PW_KEY) : null;
    if (saved) load(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit() {
    const ok = await load(pw);
    if (ok) {
      try {
        window.sessionStorage.setItem(PW_KEY, pw);
      } catch {
        /* ignore */
      }
    }
  }

  return (
    <main className="fl-wrap" style={{ minHeight: "100vh", maxWidth: 860 }}>
      <div style={{ position: "absolute", top: 40, right: 22 }}>
        <LangToggle />
      </div>
      <div className="fl-hint" style={{ color: C.brass, marginBottom: 20 }}>
        {tr("adminTitle", lang)}
      </div>

      {!authed ? (
        <div style={{ maxWidth: 360, marginTop: 30 }}>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={tr("adminPassword", lang)}
            style={{
              display: "block",
              width: "100%",
              padding: "12px 16px",
              borderRadius: 12,
              border: `1px solid ${C.line}`,
              background: C.panel,
              color: C.porcelain,
              fontSize: 16,
            }}
          />
          <button className="fl-btn fl-reveal" onClick={submit} disabled={busy} style={{ marginTop: 14 }}>
            {tr("adminLogin", lang)}
          </button>
          {error && <p style={{ color: C.blush, fontSize: 13, marginTop: 12 }}>{tr("adminWrong", lang)}</p>}
        </div>
      ) : (
        <div style={{ marginTop: 20 }}>
          {subjects.length === 0 ? (
            <p style={{ color: C.muted }}>{tr("adminEmpty", lang)}</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {subjects.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 14,
                    flexWrap: "wrap",
                    padding: "14px 18px",
                    borderRadius: 14,
                    border: `1px solid ${C.line}`,
                    background: "linear-gradient(165deg, var(--ink2), var(--panel))",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: DISPLAY, fontSize: 19 }}>{s.name}</div>
                    <div className="fl-hint" style={{ textTransform: "none", letterSpacing: 0, color: C.muted, marginTop: 2 }}>
                      {s.email ?? "—"} · {new Date(s.createdAt).toLocaleDateString()} ·{" "}
                      <span title={tr("adminCol360", lang)}>
                        360 ({s.invitationCount} · {s.responseCount})
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 14, flexShrink: 0 }}>
                    <Link href={`/diagnostic/resultat?id=${s.id}`} style={{ color: C.brass, fontSize: 13.5 }}>
                      {tr("adminView", lang)}
                    </Link>
                    {s.invitationCount > 0 && (
                      <Link href={`/360/resultat?id=${s.id}`} style={{ color: C.brass, fontSize: 13.5 }}>
                        {tr("admin360", lang)}
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}

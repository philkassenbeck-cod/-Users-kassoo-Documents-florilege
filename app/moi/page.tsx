"use client";

// Point d'arrivée après le lien magique : dirige vers le florilège existant
// (s'il y en a un) ou vers le test.

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";
import { useLang } from "@/components/LanguageProvider";
import { C, DISPLAY } from "@/components/theme";
import { tr } from "@/content/ui";

export default function Moi() {
  const router = useRouter();
  const { lang } = useLang();

  useEffect(() => {
    let done = false;
    async function go(token: string) {
      try {
        const res = await fetch("/api/me", { headers: { Authorization: `Bearer ${token}` } });
        const j = await res.json();
        if (j.subject && j.subject.hasScores) router.replace(`/diagnostic/resultat?id=${j.subject.id}`);
        else router.replace("/diagnostic");
      } catch {
        router.replace("/diagnostic");
      }
    }
    supabase.auth.getSession().then(({ data }) => {
      if (data.session && !done) {
        done = true;
        go(data.session.access_token);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session && !done) {
        done = true;
        go(session.access_token);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [router]);

  return (
    <main className="fl-wrap" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontFamily: DISPLAY, fontStyle: "italic", color: C.muted, fontSize: 18 }}>{tr("loading", lang)}</p>
    </main>
  );
}

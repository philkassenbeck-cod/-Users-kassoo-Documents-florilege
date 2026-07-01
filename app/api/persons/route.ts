// app/api/persons/route.ts
// Persiste une personne à la fin du test self, et lui envoie son lien perso.

import { getStore } from "@/lib/store";
import { sendPersonalLink } from "@/lib/email";
import { florilegeData as data } from "@core";

function siteOrigin(req: Request): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  if (host) return `${proto}://${host}`;
  return new URL(req.url).origin;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.name !== "string" || !body.name.trim()) {
    return Response.json({ error: "name requis" }, { status: 400 });
  }
  const email = typeof body.email === "string" && body.email.includes("@") ? body.email.trim().slice(0, 120) : null;
  const lang = body.lang === "en" ? "en" : "fr";

  const store = getStore();
  const subject = await store.createPerson({
    name: String(body.name).trim().slice(0, 60),
    email,
    pronoun: data.three_sixty.subject_pronoun.default,
    lang,
    selfScores: body.selfScores ?? {},
  });

  const link = `${siteOrigin(req)}/diagnostic/resultat?id=${subject.id}`;
  let emailed = false;
  if (email) {
    emailed = await sendPersonalLink({ to: email, name: subject.name, url: link, lang });
  }

  return Response.json({ id: subject.id, link, emailed });
}

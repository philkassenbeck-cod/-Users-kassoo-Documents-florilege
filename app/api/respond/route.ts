// app/api/respond/route.ts
// GET  ?token= → métadonnées du formulaire répondant (prénom du sujet, cercle, langue).
// POST { token, answers } → enregistre la réponse (consentement impliqué à l'envoi).

import { getStore } from "@/lib/store";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) return Response.json({ error: "token requis" }, { status: 400 });

  const store = getStore();
  const inv = await store.getInvitation(token);
  if (!inv) return Response.json({ error: "lien invalide" }, { status: 404 });
  const subject = await store.getSubject(inv.subjectId);
  if (!subject) return Response.json({ error: "lien invalide" }, { status: 404 });

  return Response.json({
    name: subject.name,
    pronoun: subject.pronoun,
    lang: subject.lang,
    circle: inv.circle,
    responded: inv.responded,
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const token = body?.token ? String(body.token) : null;
  if (!token || !body?.answers || typeof body.answers !== "object") {
    return Response.json({ error: "requête invalide" }, { status: 400 });
  }
  try {
    await getStore().saveResponse(token, body.answers as Record<string, number>);
    return Response.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "erreur";
    return Response.json({ error: msg }, { status: 409 });
  }
}

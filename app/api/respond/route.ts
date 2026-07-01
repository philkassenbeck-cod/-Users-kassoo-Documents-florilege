// app/api/respond/route.ts
// GET  ?token= → métadonnées du formulaire répondant (prénom du sujet, cercle, langue).
// POST { token, answers } → enregistre la réponse (consentement impliqué à l'envoi).

import { getStore } from "@/lib/store";
import { florilegeData as data } from "@core";

function circleCanBeNamed(circleId: string): boolean {
  return !!data.three_sixty.circles.find((c) => c.id === circleId)?.can_be_named;
}

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
    canBeNamed: circleCanBeNamed(inv.circle), // manager → peut consentir à être cité
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
    const store = getStore();
    // Le nom n'est retenu que si le cercle l'autorise (manager) et qu'un nom est fourni.
    const inv = await store.getInvitation(token);
    let authorName: string | null = null;
    if (inv && circleCanBeNamed(inv.circle) && typeof body.authorName === "string") {
      const trimmed = body.authorName.trim().slice(0, 60);
      if (trimmed) authorName = trimmed;
    }
    await store.saveResponse(token, body.answers as Record<string, number>, authorName);
    return Response.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "erreur";
    return Response.json({ error: msg }, { status: 409 });
  }
}

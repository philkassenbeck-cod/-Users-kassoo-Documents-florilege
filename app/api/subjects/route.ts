// app/api/subjects/route.ts
// Crée un sujet 360 + ses invitations ; expose l'agrégat pour le débrief ;
// permet la suppression totale (RGPD — le sujet maîtrise ses données).

import { getStore } from "@/lib/store";
import type { CircleRequest, SubjectInput } from "@/lib/store";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.name !== "string" || !body.name.trim()) {
    return Response.json({ error: "name requis" }, { status: 400 });
  }
  const input: SubjectInput = {
    name: String(body.name).trim().slice(0, 60),
    pronoun: String(body.pronoun ?? "neutral"),
    lang: body.lang === "en" ? "en" : "fr",
    selfScores: body.selfScores ?? {},
  };
  const circles: CircleRequest[] = Array.isArray(body.circles)
    ? body.circles
        .map((c: { circle: string; count: number }) => ({
          circle: String(c.circle),
          count: Math.max(0, Math.min(20, Number(c.count) | 0)),
        }))
        .filter((c: CircleRequest) => c.count > 0)
    : [];

  const store = getStore();
  const { subject, invitations } = await store.createSubject(input, circles);
  return Response.json({
    subjectId: subject.id,
    invitations: invitations.map((i) => ({ token: i.token, circle: i.circle })),
  });
}

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return Response.json({ error: "id requis" }, { status: 400 });
  const store = getStore();
  const subject = await store.getSubject(id);
  if (!subject) return Response.json({ error: "introuvable" }, { status: 404 });

  const [responses, invitations] = await Promise.all([
    store.listResponses(id),
    store.listInvitations(id),
  ]);
  return Response.json({
    name: subject.name,
    lang: subject.lang,
    selfScores: subject.selfScores,
    responses, // ObserverResponse[] : { circle, responses }
    invitations: invitations.map((i) => ({ circle: i.circle, responded: i.responded })),
  });
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return Response.json({ error: "id requis" }, { status: 400 });
  await getStore().deleteSubject(id);
  return Response.json({ ok: true });
}

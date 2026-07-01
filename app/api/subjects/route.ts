// app/api/subjects/route.ts
// Crée un sujet 360 + ses invitations ; expose l'agrégat pour le débrief ;
// permet la suppression totale (RGPD — le sujet maîtrise ses données).

import { getStore } from "@/lib/store";
import type { CircleRequest } from "@/lib/store";

// 360 : ajoute des liens répondants à une personne DÉJÀ enregistrée (test self).
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const subjectId = body?.subjectId ? String(body.subjectId) : null;
  if (!subjectId) {
    return Response.json({ error: "subjectId requis" }, { status: 400 });
  }
  const store = getStore();
  const subject = await store.getSubject(subjectId);
  if (!subject) return Response.json({ error: "personne introuvable" }, { status: 404 });

  const circles: CircleRequest[] = Array.isArray(body.circles)
    ? body.circles
        .map((c: { circle: string; count: number }) => ({
          circle: String(c.circle),
          count: Math.max(0, Math.min(20, Number(c.count) | 0)),
        }))
        .filter((c: CircleRequest) => c.count > 0)
    : [];

  const invitations = await store.addInvitations(subjectId, circles);
  return Response.json({
    subjectId,
    invitations: invitations.map((i) => ({ token: i.token, circle: i.circle })),
  });
}

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return Response.json({ error: "id requis" }, { status: 400 });
  const store = getStore();
  const subject = await store.getSubject(id);
  if (!subject) return Response.json({ error: "introuvable" }, { status: 404 });

  const [responses, invitations, namedManager] = await Promise.all([
    store.listResponses(id),
    store.listInvitations(id),
    store.getNamedManager(id),
  ]);
  return Response.json({
    name: subject.name,
    lang: subject.lang,
    selfScores: subject.selfScores,
    responses, // ObserverResponse[] : { circle, responses }
    invitations: invitations.map((i) => ({ circle: i.circle, responded: i.responded })),
    namedManager, // string | null — manager ayant consenti à être cité
  });
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return Response.json({ error: "id requis" }, { status: 400 });
  await getStore().deleteSubject(id);
  return Response.json({ ok: true });
}

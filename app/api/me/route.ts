// app/api/me/route.ts — renvoie le florilège du compte connecté (ou null).

import { getStore } from "@/lib/store";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return Response.json({ error: "non connecté" }, { status: 401 });
  const subject = await getStore().getSubjectByUser(user.id);
  return Response.json({
    subject: subject ? { id: subject.id, name: subject.name, hasScores: Object.keys(subject.selfScores).length > 0 } : null,
  });
}

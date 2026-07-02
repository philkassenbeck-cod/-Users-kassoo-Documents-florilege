// app/api/persons/route.ts
// Enregistre le florilège du compte connecté (1 par utilisateur).
// L'identité (email) vient du compte Supabase, pas du client.

import { getStore } from "@/lib/store";
import { getUserFromRequest } from "@/lib/auth";
import { florilegeData as data } from "@core";

export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return Response.json({ error: "non connecté" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" && body.name.trim() ? body.name.trim().slice(0, 60) : (user.email ?? "");
  const lang = body?.lang === "en" ? "en" : "fr";

  const subject = await getStore().upsertByUser({
    name,
    email: user.email,
    userId: user.id,
    pronoun: data.three_sixty.subject_pronoun.default,
    lang,
    selfScores: body?.selfScores ?? {},
  });

  return Response.json({ id: subject.id });
}

// app/api/admin/subjects/route.ts
// Liste des personnes (admin). Protégée par un mot de passe (ADMIN_PASSWORD).

import { getStore } from "@/lib/store";

export async function GET(req: Request) {
  const expected = process.env.ADMIN_PASSWORD;
  const given = req.headers.get("x-admin-password") ?? "";
  if (!expected) {
    return Response.json({ error: "admin non configuré (ADMIN_PASSWORD manquant)" }, { status: 503 });
  }
  if (given !== expected) {
    return Response.json({ error: "mot de passe invalide" }, { status: 401 });
  }
  const subjects = await getStore().listSubjects();
  return Response.json({ subjects });
}

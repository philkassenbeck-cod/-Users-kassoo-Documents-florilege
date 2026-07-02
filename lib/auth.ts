// lib/auth.ts — vérifie côté serveur le jeton Supabase envoyé par le client.
// Renvoie l'utilisateur authentifié (id + email) ou null.

import { createClient } from "@supabase/supabase-js";

export interface AuthUser {
  id: string;
  email: string | null;
}

export async function getUserFromRequest(req: Request): Promise<AuthUser | null> {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  const sb = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email ?? null };
}

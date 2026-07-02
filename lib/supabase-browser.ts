"use client";

// Client Supabase côté navigateur (clé publique anon) — pour l'auth par lien magique.
// Même approche que LeadR. La clé anon est publique (pas secrète).
// Fallback neutre si les variables ne sont pas encore définies : évite un crash
// au build/prerender ; en production, les vraies valeurs sont injectées.

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient(url, anon);

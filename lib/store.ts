// lib/store.ts — persistance du 360 (couche APP, jamais dans core/).
// Interface + adaptateur mémoire (défaut) + sélection Supabase par env.
// RGPD/nLPD : données minimales, anonymes par défaut, le sujet peut tout supprimer.

import type { Lang, ObserverResponse } from "@core";

// ---------- Modèle ----------

export interface SubjectInput {
  name: string; // prénom du sujet, interpolé dans les items observateur ({name})
  pronoun: string; // il | elle | iel | neutral
  lang: Lang;
  selfScores: Record<string, number>; // {forceId: score} issu de la passation self
}

export interface Subject extends SubjectInput {
  id: string;
  createdAt: number;
}

export interface Invitation {
  token: string;
  subjectId: string;
  circle: string;
  consented: boolean;
  responded: boolean;
  createdAt: number;
}

export interface CircleRequest {
  circle: string;
  count: number; // nombre de liens à générer pour ce cercle
}

export interface Store {
  createSubject(input: SubjectInput, circles: CircleRequest[]): Promise<{ subject: Subject; invitations: Invitation[] }>;
  getSubject(id: string): Promise<Subject | null>;
  deleteSubject(id: string): Promise<void>; // supprime sujet + invitations + réponses (RGPD)
  listInvitations(subjectId: string): Promise<Invitation[]>;
  getInvitation(token: string): Promise<Invitation | null>;
  saveResponse(token: string, answers: Record<string, number>): Promise<void>;
  listResponses(subjectId: string): Promise<ObserverResponse[]>;
}

// ---------- Adaptateur mémoire (dev / démo) ----------
// Persisté sur globalThis pour survivre au hot-reload de Next en dev.

interface MemDB {
  subjects: Map<string, Subject>;
  invitations: Map<string, Invitation>; // clé = token
  responses: Map<string, { subjectId: string; circle: string; answers: Record<string, number> }>; // clé = token
}

function memdb(): MemDB {
  const g = globalThis as unknown as { __florilege_db?: MemDB };
  if (!g.__florilege_db) {
    g.__florilege_db = { subjects: new Map(), invitations: new Map(), responses: new Map() };
  }
  return g.__florilege_db;
}

function uid(prefix: string): string {
  return prefix + globalThis.crypto.randomUUID().replace(/-/g, "");
}

class MemoryStore implements Store {
  async createSubject(input: SubjectInput, circles: CircleRequest[]) {
    const db = memdb();
    const subject: Subject = { ...input, id: uid("s_"), createdAt: Date.now() };
    db.subjects.set(subject.id, subject);
    const invitations: Invitation[] = [];
    for (const { circle, count } of circles) {
      for (let i = 0; i < count; i++) {
        const inv: Invitation = {
          token: uid("i_"),
          subjectId: subject.id,
          circle,
          consented: false,
          responded: false,
          createdAt: Date.now(),
        };
        db.invitations.set(inv.token, inv);
        invitations.push(inv);
      }
    }
    return { subject, invitations };
  }

  async getSubject(id: string) {
    return memdb().subjects.get(id) ?? null;
  }

  async deleteSubject(id: string) {
    const db = memdb();
    db.subjects.delete(id);
    for (const [tok, inv] of db.invitations) if (inv.subjectId === id) db.invitations.delete(tok);
    for (const [tok, r] of db.responses) if (r.subjectId === id) db.responses.delete(tok);
  }

  async listInvitations(subjectId: string) {
    return [...memdb().invitations.values()].filter((i) => i.subjectId === subjectId);
  }

  async getInvitation(token: string) {
    return memdb().invitations.get(token) ?? null;
  }

  async saveResponse(token: string, answers: Record<string, number>) {
    const db = memdb();
    const inv = db.invitations.get(token);
    if (!inv) throw new Error("invitation introuvable");
    if (inv.responded) throw new Error("déjà répondu");
    db.responses.set(token, { subjectId: inv.subjectId, circle: inv.circle, answers });
    inv.consented = true;
    inv.responded = true;
  }

  async listResponses(subjectId: string): Promise<ObserverResponse[]> {
    return [...memdb().responses.values()]
      .filter((r) => r.subjectId === subjectId)
      .map((r) => ({ circle: r.circle, responses: r.answers }));
  }
}

// ---------- Sélection de l'adaptateur ----------

let singleton: Store | null = null;

export function getStore(): Store {
  if (singleton) return singleton;
  // Défaut : mémoire (dev / démo — non partagé entre instances serverless).
  //
  // PRODUCTION — pour brancher Supabase (aligné LEADR), sans toucher aux écrans :
  //   1. Appliquer `supabase/schema.sql` (tables subjects / invitations / responses).
  //   2. Créer une classe `SupabaseStore implements Store` (mêmes méthodes).
  //   3. Ici : `if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
  //             singleton = new SupabaseStore(); else singleton = new MemoryStore();`
  // L'interface `Store` est le seul contrat que consomment les routes API.
  singleton = new MemoryStore();
  return singleton;
}

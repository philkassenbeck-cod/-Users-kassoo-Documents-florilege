// lib/store.ts — persistance (couche APP, jamais dans core/).
// Personnes (test self persisté) + 360 (invitations/réponses). Interface + mémoire + Supabase.
// RGPD/nLPD : minimisation, la personne peut tout supprimer.

import type { Lang, ObserverResponse } from "@core";
import { SupabaseStore } from "./store-supabase";

// ---------- Modèle ----------

export interface SubjectInput {
  name: string; // prénom, interpolé dans les items observateur ({name})
  email: string | null; // email (issu du compte Supabase)
  userId: string | null; // id du compte Supabase (auth), s'il est connecté
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
  count: number;
}

/** Résumé pour la liste admin. */
export interface SubjectSummary {
  id: string;
  name: string;
  email: string | null;
  lang: Lang;
  createdAt: number;
  invitationCount: number;
  responseCount: number;
}

export interface Store {
  /** Persiste une personne à la fin du test self. */
  createPerson(input: SubjectInput): Promise<Subject>;
  /** Crée ou met à jour le florilège du compte connecté (1 par utilisateur). */
  upsertByUser(input: SubjectInput): Promise<Subject>;
  /** Florilège rattaché à un compte Supabase. */
  getSubjectByUser(userId: string): Promise<Subject | null>;
  getSubject(id: string): Promise<Subject | null>;
  deleteSubject(id: string): Promise<void>; // supprime personne + invitations + réponses (RGPD)
  /** Ajoute des liens répondants (360) à une personne existante. */
  addInvitations(subjectId: string, circles: CircleRequest[]): Promise<Invitation[]>;
  listInvitations(subjectId: string): Promise<Invitation[]>;
  getInvitation(token: string): Promise<Invitation | null>;
  saveResponse(token: string, answers: Record<string, number>, authorName?: string | null): Promise<void>;
  listResponses(subjectId: string): Promise<ObserverResponse[]>;
  getNamedManager(subjectId: string): Promise<string | null>;
  /** Liste toutes les personnes (admin). */
  listSubjects(): Promise<SubjectSummary[]>;
}

function uid(prefix: string): string {
  return prefix + globalThis.crypto.randomUUID().replace(/-/g, "");
}

// ---------- Adaptateur mémoire (dev / démo) ----------

interface MemDB {
  subjects: Map<string, Subject>;
  invitations: Map<string, Invitation>;
  responses: Map<
    string,
    { subjectId: string; circle: string; answers: Record<string, number>; authorName: string | null }
  >;
}

function memdb(): MemDB {
  const g = globalThis as unknown as { __florilege_db?: MemDB };
  if (!g.__florilege_db) {
    g.__florilege_db = { subjects: new Map(), invitations: new Map(), responses: new Map() };
  }
  return g.__florilege_db;
}

class MemoryStore implements Store {
  async createPerson(input: SubjectInput): Promise<Subject> {
    const subject: Subject = { ...input, id: uid("s_"), createdAt: Date.now() };
    memdb().subjects.set(subject.id, subject);
    return subject;
  }

  async getSubjectByUser(userId: string): Promise<Subject | null> {
    return [...memdb().subjects.values()].find((s) => s.userId === userId) ?? null;
  }

  async upsertByUser(input: SubjectInput): Promise<Subject> {
    const existing = input.userId ? await this.getSubjectByUser(input.userId) : null;
    if (existing) {
      const updated: Subject = { ...existing, name: input.name, email: input.email, lang: input.lang, selfScores: input.selfScores };
      memdb().subjects.set(updated.id, updated);
      return updated;
    }
    return this.createPerson(input);
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

  async addInvitations(subjectId: string, circles: CircleRequest[]): Promise<Invitation[]> {
    const db = memdb();
    const invitations: Invitation[] = [];
    for (const { circle, count } of circles) {
      for (let i = 0; i < count; i++) {
        const inv: Invitation = {
          token: uid("i_"),
          subjectId,
          circle,
          consented: false,
          responded: false,
          createdAt: Date.now(),
        };
        db.invitations.set(inv.token, inv);
        invitations.push(inv);
      }
    }
    return invitations;
  }

  async listInvitations(subjectId: string) {
    return [...memdb().invitations.values()].filter((i) => i.subjectId === subjectId);
  }

  async getInvitation(token: string) {
    return memdb().invitations.get(token) ?? null;
  }

  async saveResponse(token: string, answers: Record<string, number>, authorName: string | null = null) {
    const db = memdb();
    const inv = db.invitations.get(token);
    if (!inv) throw new Error("invitation introuvable");
    if (inv.responded) throw new Error("déjà répondu");
    db.responses.set(token, { subjectId: inv.subjectId, circle: inv.circle, answers, authorName });
    inv.consented = true;
    inv.responded = true;
  }

  async listResponses(subjectId: string): Promise<ObserverResponse[]> {
    return [...memdb().responses.values()]
      .filter((r) => r.subjectId === subjectId)
      .map((r) => ({ circle: r.circle, responses: r.answers }));
  }

  async getNamedManager(subjectId: string): Promise<string | null> {
    const named = [...memdb().responses.values()].find(
      (r) => r.subjectId === subjectId && r.circle === "manager" && !!r.authorName
    );
    return named?.authorName ?? null;
  }

  async listSubjects(): Promise<SubjectSummary[]> {
    const db = memdb();
    const invs = [...db.invitations.values()];
    const resp = [...db.responses.values()];
    return [...db.subjects.values()]
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        lang: s.lang,
        createdAt: s.createdAt,
        invitationCount: invs.filter((i) => i.subjectId === s.id).length,
        responseCount: resp.filter((r) => r.subjectId === s.id).length,
      }));
  }
}

// ---------- Sélection de l'adaptateur ----------

let singleton: Store | null = null;

export function getStore(): Store {
  if (singleton) return singleton;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  singleton = url && key ? new SupabaseStore(url, key) : new MemoryStore();
  return singleton;
}

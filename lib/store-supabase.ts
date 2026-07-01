// lib/store-supabase.ts — implémentation Supabase du contrat Store.
// Server-only (service_role key). Appliquer d'abord supabase/schema.sql.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ObserverResponse } from "@core";
import type {
  Store,
  Subject,
  SubjectInput,
  Invitation,
  CircleRequest,
  SubjectSummary,
} from "./store";

function uid(prefix: string): string {
  return prefix + globalThis.crypto.randomUUID().replace(/-/g, "");
}

type Row = Record<string, unknown>;

function ts(v: unknown): number {
  return v ? new Date(String(v)).getTime() : Date.now();
}

function mapInvitation(d: Row): Invitation {
  return {
    token: String(d.token),
    subjectId: String(d.subject_id),
    circle: String(d.circle),
    consented: Boolean(d.consented),
    responded: Boolean(d.responded),
    createdAt: ts(d.created_at),
  };
}

export class SupabaseStore implements Store {
  private db: SupabaseClient;

  constructor(url: string, serviceKey: string) {
    this.db = createClient(url, serviceKey, { auth: { persistSession: false } });
  }

  async createPerson(input: SubjectInput): Promise<Subject> {
    const subject: Subject = { ...input, id: uid("s_"), createdAt: Date.now() };
    const { error } = await this.db.from("subjects").insert({
      id: subject.id,
      name: subject.name,
      email: subject.email,
      pronoun: subject.pronoun,
      lang: subject.lang,
      self_scores: subject.selfScores,
    });
    if (error) throw new Error(error.message);
    return subject;
  }

  async getSubject(id: string): Promise<Subject | null> {
    const { data } = await this.db.from("subjects").select("*").eq("id", id).maybeSingle();
    if (!data) return null;
    const d = data as Row;
    return {
      id: String(d.id),
      name: String(d.name),
      email: d.email ? String(d.email) : null,
      pronoun: String(d.pronoun),
      lang: d.lang === "en" ? "en" : "fr",
      selfScores: (d.self_scores ?? {}) as Record<string, number>,
      createdAt: ts(d.created_at),
    };
  }

  async deleteSubject(id: string): Promise<void> {
    // FK on delete cascade → invitations + responses effacées (RGPD).
    const { error } = await this.db.from("subjects").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  async addInvitations(subjectId: string, circles: CircleRequest[]): Promise<Invitation[]> {
    const invitations: Invitation[] = [];
    for (const { circle, count } of circles) {
      for (let i = 0; i < count; i++) {
        invitations.push({
          token: uid("i_"),
          subjectId,
          circle,
          consented: false,
          responded: false,
          createdAt: Date.now(),
        });
      }
    }
    if (invitations.length) {
      const { error } = await this.db.from("invitations").insert(
        invitations.map((v) => ({
          token: v.token,
          subject_id: v.subjectId,
          circle: v.circle,
          consented: false,
          responded: false,
        }))
      );
      if (error) throw new Error(error.message);
    }
    return invitations;
  }

  async listInvitations(subjectId: string): Promise<Invitation[]> {
    const { data } = await this.db.from("invitations").select("*").eq("subject_id", subjectId);
    return ((data ?? []) as Row[]).map(mapInvitation);
  }

  async getInvitation(token: string): Promise<Invitation | null> {
    const { data } = await this.db.from("invitations").select("*").eq("token", token).maybeSingle();
    return data ? mapInvitation(data as Row) : null;
  }

  async saveResponse(token: string, answers: Record<string, number>, authorName: string | null = null): Promise<void> {
    const inv = await this.getInvitation(token);
    if (!inv) throw new Error("invitation introuvable");
    if (inv.responded) throw new Error("déjà répondu");
    const { error: e1 } = await this.db.from("responses").insert({
      token,
      subject_id: inv.subjectId,
      circle: inv.circle,
      answers,
      author_name: authorName,
    });
    if (e1) throw new Error(e1.message);
    const { error: e2 } = await this.db
      .from("invitations")
      .update({ consented: true, responded: true })
      .eq("token", token);
    if (e2) throw new Error(e2.message);
  }

  async listResponses(subjectId: string): Promise<ObserverResponse[]> {
    const { data } = await this.db.from("responses").select("circle, answers").eq("subject_id", subjectId);
    return ((data ?? []) as Row[]).map((r) => ({
      circle: String(r.circle),
      responses: (r.answers ?? {}) as Record<string, number>,
    }));
  }

  async getNamedManager(subjectId: string): Promise<string | null> {
    const { data } = await this.db
      .from("responses")
      .select("author_name")
      .eq("subject_id", subjectId)
      .eq("circle", "manager")
      .not("author_name", "is", null)
      .limit(1)
      .maybeSingle();
    const name = data ? (data as Row).author_name : null;
    return name ? String(name) : null;
  }

  async listSubjects(): Promise<SubjectSummary[]> {
    const { data: subjects } = await this.db
      .from("subjects")
      .select("*")
      .order("created_at", { ascending: false });
    const { data: invs } = await this.db.from("invitations").select("subject_id");
    const { data: resp } = await this.db.from("responses").select("subject_id");
    const invBy = tally((invs ?? []) as Row[]);
    const respBy = tally((resp ?? []) as Row[]);
    return ((subjects ?? []) as Row[]).map((d) => ({
      id: String(d.id),
      name: String(d.name),
      email: d.email ? String(d.email) : null,
      lang: d.lang === "en" ? "en" : "fr",
      createdAt: ts(d.created_at),
      invitationCount: invBy[String(d.id)] ?? 0,
      responseCount: respBy[String(d.id)] ?? 0,
    }));
  }
}

function tally(rows: Row[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of rows) {
    const k = String(r.subject_id);
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}

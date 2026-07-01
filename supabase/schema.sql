-- Florilège 360 — schéma Supabase (à appliquer pour la persistance production).
-- RGPD/nLPD : données minimales, anonymes par défaut. La suppression du sujet
-- efface en cascade invitations + réponses.

create table if not exists subjects (
  id          text primary key,
  name        text not null,
  pronoun     text not null default 'neutral',
  lang        text not null default 'fr',
  self_scores jsonb not null,           -- { forceId: score }
  created_at  timestamptz not null default now()
);

create table if not exists invitations (
  token       text primary key,
  subject_id  text not null references subjects(id) on delete cascade,
  circle      text not null,            -- manager | peers | team | close
  consented   boolean not null default false,
  responded   boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists responses (
  token       text primary key references invitations(token) on delete cascade,
  subject_id  text not null references subjects(id) on delete cascade,
  circle      text not null,
  answers     jsonb not null,           -- { itemId: 1..5 } sur les 16 items 360
  created_at  timestamptz not null default now()
);

create index if not exists idx_invitations_subject on invitations(subject_id);
create index if not exists idx_responses_subject on responses(subject_id);

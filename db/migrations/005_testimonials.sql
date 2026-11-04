-- ============================================================================
-- Depoimentos (prova social do portfólio)
-- ----------------------------------------------------------------------------
-- Chegam de dois jeitos: o cliente que aceitou uma proposta responde pelo link
-- /depoimento/<token> (proposal_id preenchido), ou a equipe cadastra um que
-- recebeu por outro canal, marcando que o cliente autorizou a publicação.
-- Só aparecem no site quando published = true (aprovação no painel).
-- ============================================================================
create table testimonials (
  id           uuid primary key default gen_random_uuid(),
  proposal_id  uuid references proposals (id) on delete set null,
  platform_id  text references platforms (id) on delete set null,
  name         text not null check (char_length(btrim(name)) between 2 and 120),
  role         text check (role is null or char_length(role) <= 120),
  company      text check (company is null or char_length(company) <= 120),
  quote        text not null check (char_length(btrim(quote)) between 20 and 1200),
  rating       int check (rating is null or rating between 1 and 5),
  consent      boolean not null default false,   -- autorizou publicar nome, cargo e empresa
  published    boolean not null default false,
  sort_order   int not null default 100,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint published_needs_consent check (not published or consent)
);
create index testimonials_pub_idx on testimonials (published, sort_order);
create unique index testimonials_one_per_proposal on testimonials (proposal_id) where proposal_id is not null;
create trigger testimonials_touch before update on testimonials for each row execute function touch_updated_at();

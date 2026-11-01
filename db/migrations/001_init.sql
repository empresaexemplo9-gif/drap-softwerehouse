-- ============================================================================
-- DRAP SoftwareHouse & Business — esquema inicial (Postgres / Neon)
-- ----------------------------------------------------------------------------
-- platforms       catálogo de plataformas exibido na home
-- site_settings   contatos editáveis pelo painel
-- leads           pedidos de demonstração do formulário
-- login_attempts  tentativas de login no painel (limite contra força bruta)
--
-- O banco só é acessado pelas funções em /api (servidor). O navegador nunca
-- recebe a connection string. Aplicado automaticamente por scripts/migrate.mjs.
-- ============================================================================

create extension if not exists citext;
create extension if not exists pgcrypto;

create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ------------------------------------------------------------- platforms ----
create table platforms (
  id            text primary key check (id ~ '^[a-z0-9-]{2,40}$'),
  name          text not null check (char_length(name) between 2 and 80),
  code          text not null check (char_length(code) between 2 and 20),
  category      text not null check (char_length(category) between 2 and 60),
  tagline       text not null default '' check (char_length(tagline) <= 160),
  summary       text not null default '' check (char_length(summary) <= 600),
  features      text[] not null default '{}' check (cardinality(features) <= 6),
  stack         text[] not null default '{}' check (cardinality(stack) <= 6),
  status        text not null default 'Disponível' check (status in ('Disponível', 'Beta', 'Sob demanda')),
  palette       text[] not null check (cardinality(palette) between 1 and 6),
  logo_svg      text check (logo_svg is null or char_length(logo_svg) <= 20000),
  logo_url      text,
  preview_key   text,
  preview_image text,
  url           text not null default '#contato' check (char_length(url) <= 300),
  repo          text,
  sort_order    int not null default 100,
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint palette_hex check (array_to_string(palette, ',') ~ '^(#[0-9A-Fa-f]{6})(,#[0-9A-Fa-f]{6})*$')
);
create index platforms_order_idx on platforms (active, sort_order);
create trigger platforms_touch before update on platforms for each row execute function touch_updated_at();

-- --------------------------------------------------------- site_settings ----
create table site_settings (
  key        text primary key check (key ~ '^[a-z0-9_]{2,40}$'),
  value      text not null check (char_length(value) <= 500),
  updated_at timestamptz not null default now()
);
create trigger site_settings_touch before update on site_settings for each row execute function touch_updated_at();

-- ----------------------------------------------------------------- leads ----
create table leads (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(btrim(name)) between 2 and 120),
  email       citext not null check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 254),
  phone       text check (phone is null or char_length(phone) <= 40),
  company     text check (company is null or char_length(company) <= 120),
  platform_id text references platforms (id) on delete set null,
  interest    text check (interest is null or char_length(interest) <= 80),
  message     text check (message is null or char_length(message) <= 2000),
  source      text check (source is null or char_length(source) <= 200),
  ip_hash     text,
  status      text not null default 'novo' check (status in ('novo', 'em_contato', 'proposta', 'ganho', 'perdido')),
  notes       text check (notes is null or char_length(notes) <= 4000),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index leads_created_idx on leads (created_at desc);
create index leads_status_idx on leads (status);
create index leads_email_recent_idx on leads (email, created_at);
create index leads_ip_recent_idx on leads (ip_hash, created_at);
create trigger leads_touch before update on leads for each row execute function touch_updated_at();

-- -------------------------------------------------------- login_attempts ----
create table login_attempts (
  id         bigserial primary key,
  ip_hash    text not null,
  ok         boolean not null,
  created_at timestamptz not null default now()
);
create index login_attempts_recent_idx on login_attempts (ip_hash, created_at);

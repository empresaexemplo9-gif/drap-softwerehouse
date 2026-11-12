-- ============================================================================
-- Plataformas sob medida: questionário do cliente → proposta comercial
-- ----------------------------------------------------------------------------
-- proposals  uma proposta por questionário (ou criada à mão no painel).
--            O link público usa `token` (aleatório, 32 caracteres).
--            items = [{ key, kind: core|module, name, description, icon,
--                       setup, monthly, selected, origin, market }]
-- ============================================================================

create sequence proposal_number_seq start 1;

create table proposals (
  id            uuid primary key default gen_random_uuid(),
  token         text not null unique check (token ~ '^[A-Za-z0-9_-]{24,64}$'),
  number        text not null unique default ('DRAP-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('proposal_number_seq')::text, 4, '0')),
  lead_id       uuid references leads (id) on delete set null,
  status        text not null default 'em_analise'
                check (status in ('em_analise', 'rascunho', 'enviada', 'visualizada', 'aceita', 'recusada')),
  complexity    text not null default 'media' check (complexity in ('simples', 'media', 'complexa')),
  score         int not null default 0,
  reasons       text[] not null default '{}',
  auto          boolean not null default false,          -- gerada e enviada automaticamente

  client_name   text not null check (char_length(client_name) between 2 and 120),
  client_email  citext not null check (client_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  client_phone  text check (client_phone is null or char_length(client_phone) <= 40),
  client_company text check (client_company is null or char_length(client_company) <= 120),

  brief         jsonb not null default '{}',              -- respostas do questionário
  title         text not null check (char_length(title) between 2 and 140),
  intro         text not null default '' check (char_length(intro) <= 4000),
  items         jsonb not null default '[]' check (jsonb_typeof(items) = 'array'),
  discount_pct  numeric(5,2) not null default 0 check (discount_pct between 0 and 60),
  weeks         int not null default 8 check (weeks between 1 and 104),
  payment_terms text not null default '' check (char_length(payment_terms) <= 1000),
  show_market   boolean not null default true,
  valid_until   date not null default (current_date + 15),
  internal_notes text check (internal_notes is null or char_length(internal_notes) <= 4000),

  ip_hash       text,
  sent_at       timestamptz,
  viewed_at     timestamptz,
  view_count    int not null default 0,
  decided_at    timestamptz,
  accepted_keys text[],                                   -- módulos escolhidos pelo cliente ao aceitar
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index proposals_created_idx on proposals (created_at desc);
create index proposals_ip_recent_idx on proposals (ip_hash, created_at);
create index proposals_email_recent_idx on proposals (client_email, created_at);
create trigger proposals_touch before update on proposals for each row execute function touch_updated_at();

-- Liga/desliga o envio automático das propostas simples (painel → Configurações)
insert into site_settings (key, value) values ('proposal_auto_send', 'sim') on conflict (key) do nothing;

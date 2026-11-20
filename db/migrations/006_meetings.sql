-- ============================================================================
-- Reuniões de negociação (online ou presencial), marcadas pelo próprio cliente
-- ----------------------------------------------------------------------------
-- O cliente escolhe um horário livre em /agendar (ou pelo botão da proposta).
-- Entra como "solicitada"; a equipe confirma no painel (e, se for online,
-- informa o link da videochamada). Um horário ocupado não aparece para outro.
-- token: link para o cliente ver ou cancelar a própria reunião.
-- ============================================================================
create table meetings (
  id           uuid primary key default gen_random_uuid(),
  token        text not null unique check (token ~ '^[A-Za-z0-9_-]{24,64}$'),
  proposal_id  uuid references proposals (id) on delete set null,
  lead_id      uuid references leads (id) on delete set null,
  platform_id  text references platforms (id) on delete set null,
  name         text not null check (char_length(btrim(name)) between 2 and 120),
  email        citext not null check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone        text check (phone is null or char_length(phone) <= 40),
  company      text check (company is null or char_length(company) <= 120),
  mode         text not null check (mode in ('online', 'presencial')),
  place        text check (place is null or place in ('drap', 'cliente')),   -- presencial: no escritório da DRAP ou na empresa do cliente
  address      text check (address is null or char_length(address) <= 300),
  starts_at    timestamptz not null,
  duration_min int not null default 45 check (duration_min between 15 and 240),
  topic        text check (topic is null or char_length(topic) <= 120),
  notes        text check (notes is null or char_length(notes) <= 1500),
  status       text not null default 'solicitada' check (status in ('solicitada', 'confirmada', 'realizada', 'cancelada')),
  meet_link    text check (meet_link is null or char_length(meet_link) <= 300),
  internal_notes text check (internal_notes is null or char_length(internal_notes) <= 2000),
  source       text check (source is null or char_length(source) <= 200),
  ip_hash      text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
-- um horário só pode ter uma reunião ativa
create unique index meetings_slot_active on meetings (starts_at) where status in ('solicitada', 'confirmada');
create index meetings_starts_idx on meetings (starts_at);
create index meetings_ip_recent_idx on meetings (ip_hash, created_at);
create trigger meetings_touch before update on meetings for each row execute function touch_updated_at();

-- Agenda de atendimento (editável em Painel → Configurações)
insert into site_settings (key, value) values
  ('meeting_days', '1,2,3,4,5'),          -- dias da semana (0 = domingo … 6 = sábado)
  ('meeting_start', '09:00'),
  ('meeting_end', '18:00'),
  ('meeting_lunch', '12:00-13:00'),       -- intervalo sem reuniões ("" para nenhum)
  ('meeting_duration', '45'),             -- minutos
  ('meeting_notice_hours', '24'),         -- antecedência mínima
  ('meeting_horizon_days', '21'),         -- até quantos dias à frente
  ('meeting_address', 'Escritório DRAP (endereço enviado na confirmação)')
on conflict (key) do nothing;

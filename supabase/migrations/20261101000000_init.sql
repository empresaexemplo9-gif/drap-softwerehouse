-- ============================================================================
-- DRAP SoftwareHouse & Business — esquema inicial
-- ----------------------------------------------------------------------------
-- platforms      catálogo de plataformas exibido na home (leitura pública)
-- site_settings  contatos e textos editáveis (leitura pública)
-- leads          pedidos de demonstração do formulário (só inserção pública)
-- admins         usuários do Supabase Auth com acesso ao painel /admin
--
-- Segurança: RLS ligado em todas as tabelas. O visitante (anon) só lê o que é
-- público e só insere leads; tudo o mais exige um usuário listado em admins.
-- ============================================================================

create extension if not exists citext;

-- ---------------------------------------------------------------- admins ----
create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

-- Função usada pelas políticas. SECURITY DEFINER para ler admins sem recursão de RLS.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create policy "admins: admin lê" on public.admins
  for select to authenticated using (public.is_admin());

-- ------------------------------------------------------- updated_at helper --
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ------------------------------------------------------------- platforms ----
create table public.platforms (
  id           text primary key check (id ~ '^[a-z0-9-]{2,40}$'),
  name         text not null check (char_length(name) between 2 and 80),
  code         text not null check (char_length(code) between 2 and 20),
  category     text not null check (char_length(category) between 2 and 60),
  tagline      text not null default '' check (char_length(tagline) <= 160),
  summary      text not null default '' check (char_length(summary) <= 600),
  features     text[] not null default '{}' check (cardinality(features) <= 6),
  stack        text[] not null default '{}' check (cardinality(stack) <= 6),
  status       text not null default 'Disponível' check (status in ('Disponível', 'Beta', 'Sob demanda')),
  palette      text[] not null check (cardinality(palette) between 1 and 6),
  logo_svg     text check (logo_svg is null or char_length(logo_svg) <= 20000),
  logo_url     text,
  preview_key  text,
  preview_image text,
  url          text not null default '#contato',
  repo         text,
  sort_order   int not null default 100,
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint palette_hex check (array_to_string(palette, ',') ~ '^(#[0-9A-Fa-f]{6})(,#[0-9A-Fa-f]{6})*$')
);
create index platforms_order_idx on public.platforms (active, sort_order);
create trigger platforms_touch before update on public.platforms
  for each row execute function public.touch_updated_at();
alter table public.platforms enable row level security;

create policy "platforms: público lê ativas" on public.platforms
  for select to anon, authenticated using (active or public.is_admin());
create policy "platforms: admin insere" on public.platforms
  for insert to authenticated with check (public.is_admin());
create policy "platforms: admin altera" on public.platforms
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "platforms: admin remove" on public.platforms
  for delete to authenticated using (public.is_admin());

-- --------------------------------------------------------- site_settings ----
create table public.site_settings (
  key        text primary key check (key ~ '^[a-z0-9_]{2,40}$'),
  value      text not null check (char_length(value) <= 500),
  updated_at timestamptz not null default now()
);
create trigger site_settings_touch before update on public.site_settings
  for each row execute function public.touch_updated_at();
alter table public.site_settings enable row level security;

create policy "settings: público lê" on public.site_settings
  for select to anon, authenticated using (true);
create policy "settings: admin escreve" on public.site_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ----------------------------------------------------------------- leads ----
create table public.leads (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(btrim(name)) between 2 and 120),
  email       citext not null check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 254),
  phone       text check (phone is null or char_length(phone) <= 40),
  company     text check (company is null or char_length(company) <= 120),
  platform_id text references public.platforms (id) on delete set null,
  interest    text check (interest is null or char_length(interest) <= 80),
  message     text check (message is null or char_length(message) <= 2000),
  source      text check (source is null or char_length(source) <= 200),
  status      text not null default 'novo' check (status in ('novo', 'em_contato', 'proposta', 'ganho', 'perdido')),
  notes       text check (notes is null or char_length(notes) <= 4000),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index leads_created_idx on public.leads (created_at desc);
create index leads_status_idx on public.leads (status);
create trigger leads_touch before update on public.leads
  for each row execute function public.touch_updated_at();
alter table public.leads enable row level security;

-- O visitante só cria leads novos; não lê, não altera e não define status/notas.
create policy "leads: público cria" on public.leads
  for insert to anon, authenticated
  with check (status = 'novo' and notes is null);
create policy "leads: admin lê" on public.leads
  for select to authenticated using (public.is_admin());
create policy "leads: admin altera" on public.leads
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "leads: admin remove" on public.leads
  for delete to authenticated using (public.is_admin());

-- Limite anti-spam: no máximo 5 leads por e-mail a cada 10 minutos.
create or replace function public.leads_rate_limit()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.leads
       where email = new.email and created_at > now() - interval '10 minutes') >= 5 then
    raise exception 'Muitas solicitações. Tente novamente em alguns minutos.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
create trigger leads_rate_limit before insert on public.leads
  for each row execute function public.leads_rate_limit();

-- ------------------------------------------------------------ privilégios ---
-- Supabase concede privilégios amplos por padrão; deixamos explícito o mínimo.
revoke all on public.platforms, public.site_settings, public.leads, public.admins from anon;
grant select on public.platforms, public.site_settings to anon;
grant insert (name, email, phone, company, platform_id, interest, message, source) on public.leads to anon;
grant select, insert, update, delete on public.platforms, public.site_settings, public.leads to authenticated;
grant select on public.admins to authenticated;

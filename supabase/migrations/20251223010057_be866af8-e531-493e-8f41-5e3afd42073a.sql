-- =============================================
-- FASE 1: CRIAR TABELAS
-- =============================================

-- 1.1 users_profile - Perfil do jogador (1:1 com auth.users)
create table public.users_profile (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  username text not null,
  total_xp integer not null default 0,
  level integer not null default 1,
  coins integer not null default 0,
  secondary_slots integer not null default 1,
  bonus_slots integer not null default 1,
  has_forgiveness boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 1.2 habits - Hábitos persistentes (com DELETE permitido)
create table public.habits (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.users_profile(id) on delete cascade,
  name text not null,
  type text not null check (type in ('positive', 'negative')),
  xp_value integer not null,
  created_at timestamptz not null default now()
);

-- 1.3 days - Ciclos diários
create table public.days (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.users_profile(id) on delete cascade,
  date date not null,
  status text not null default 'open' check (status in ('open', 'closed')),
  xp_gained integer not null default 0,
  xp_lost integer not null default 0,
  coins_earned integer not null default 0,
  is_forgiveness boolean not null default false,
  created_at timestamptz not null default now(),
  closed_at timestamptz,
  unique(profile_id, date)
);

-- 1.4 missions - Sem xp_reward, apenas coin_reward
create table public.missions (
  id uuid primary key default gen_random_uuid(),
  day_id uuid not null references public.days(id) on delete cascade,
  type text not null check (type in ('main', 'secondary', 'bonus')),
  title text not null,
  description text,
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed')),
  coin_reward integer not null default 0,
  created_at timestamptz not null default now()
);

-- 1.5 habit_logs - Imutável, habit_id ON DELETE SET NULL
create table public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  day_id uuid not null references public.days(id) on delete cascade,
  habit_id uuid references public.habits(id) on delete set null,
  habit_name text not null,
  habit_type text not null check (habit_type in ('positive', 'negative')),
  xp_value integer not null,
  created_at timestamptz not null default now()
);

-- 1.6 events - Log imutável
create table public.events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.users_profile(id) on delete cascade,
  type text not null,
  details text not null,
  xp_change integer,
  coin_change integer,
  created_at timestamptz not null default now()
);

-- 1.7 store_rewards - Global, sem profile_id
create table public.store_rewards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  cost integer not null,
  available boolean not null default true,
  created_at timestamptz not null default now()
);

-- 1.8 redeemed_rewards - Histórico de resgates
create table public.redeemed_rewards (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.users_profile(id) on delete cascade,
  reward_id uuid references public.store_rewards(id) on delete set null,
  reward_name text not null,
  reward_cost integer not null,
  redeemed_at timestamptz not null default now()
);

-- =============================================
-- FASE 2: FUNÇÕES DE SEGURANÇA (após tabelas existirem)
-- =============================================

-- Função para obter profile_id do usuário autenticado
create or replace function public.get_user_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.users_profile where user_id = auth.uid()
$$;

-- Função para verificar se dia está aberto e pertence ao usuário
create or replace function public.is_day_open(day_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.days
    where id = day_uuid
      and status = 'open'
      and profile_id = public.get_user_profile_id()
  )
$$;

-- =============================================
-- FASE 3: HABILITAR RLS EM TODAS AS TABELAS
-- =============================================

alter table public.users_profile enable row level security;
alter table public.habits enable row level security;
alter table public.days enable row level security;
alter table public.missions enable row level security;
alter table public.habit_logs enable row level security;
alter table public.events enable row level security;
alter table public.store_rewards enable row level security;
alter table public.redeemed_rewards enable row level security;

-- =============================================
-- FASE 4: RLS POLICIES
-- =============================================

-- 4.1 users_profile (SELECT, INSERT, UPDATE - sem DELETE)
create policy "select_own_profile" on public.users_profile
  for select using (auth.uid() = user_id);

create policy "insert_own_profile" on public.users_profile
  for insert with check (auth.uid() = user_id);

create policy "update_own_profile" on public.users_profile
  for update using (auth.uid() = user_id);

-- 4.2 habits (SELECT, INSERT, UPDATE, DELETE)
create policy "select_own_habits" on public.habits
  for select using (profile_id = public.get_user_profile_id());

create policy "insert_own_habits" on public.habits
  for insert with check (profile_id = public.get_user_profile_id());

create policy "update_own_habits" on public.habits
  for update using (profile_id = public.get_user_profile_id());

create policy "delete_own_habits" on public.habits
  for delete using (profile_id = public.get_user_profile_id());

-- 4.3 days (SELECT, INSERT, UPDATE só se open - sem DELETE)
create policy "select_own_days" on public.days
  for select using (profile_id = public.get_user_profile_id());

create policy "insert_own_days" on public.days
  for insert with check (profile_id = public.get_user_profile_id());

create policy "update_own_open_days" on public.days
  for update using (
    profile_id = public.get_user_profile_id() 
    and status = 'open'
  );

-- 4.4 missions (SELECT via ownership, INSERT/UPDATE/DELETE só se dia open)
create policy "select_own_missions" on public.missions
  for select using (
    exists (
      select 1 from public.days 
      where id = day_id 
      and profile_id = public.get_user_profile_id()
    )
  );

create policy "insert_missions_open_day" on public.missions
  for insert with check (public.is_day_open(day_id));

create policy "update_missions_open_day" on public.missions
  for update using (public.is_day_open(day_id));

create policy "delete_missions_open_day" on public.missions
  for delete using (public.is_day_open(day_id));

-- 4.5 habit_logs (SELECT, INSERT - sem UPDATE, sem DELETE)
create policy "select_own_habit_logs" on public.habit_logs
  for select using (
    exists (
      select 1 from public.days 
      where id = day_id 
      and profile_id = public.get_user_profile_id()
    )
  );

create policy "insert_habit_logs_open_day" on public.habit_logs
  for insert with check (public.is_day_open(day_id));

-- 4.6 events (SELECT, INSERT - sem UPDATE, sem DELETE)
create policy "select_own_events" on public.events
  for select using (profile_id = public.get_user_profile_id());

create policy "insert_own_events" on public.events
  for insert with check (profile_id = public.get_user_profile_id());

-- 4.7 store_rewards (apenas SELECT para usuários autenticados)
create policy "select_store_rewards" on public.store_rewards
  for select using (auth.uid() is not null);

-- 4.8 redeemed_rewards (SELECT, INSERT - sem UPDATE, sem DELETE)
create policy "select_own_redeemed" on public.redeemed_rewards
  for select using (profile_id = public.get_user_profile_id());

create policy "insert_own_redeemed" on public.redeemed_rewards
  for insert with check (profile_id = public.get_user_profile_id());

-- =============================================
-- FASE 5: TRIGGERS
-- =============================================

-- 5.1 Auto-criar perfil no registro
create or replace function public.create_user_profile()
returns trigger as $$
begin
  insert into public.users_profile (user_id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.create_user_profile();

-- 5.2 Atualizar updated_at em users_profile
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_users_profile_updated_at
before update on public.users_profile
for each row execute function public.update_updated_at();

-- =============================================
-- FASE 6: DADOS INICIAIS DA LOJA
-- =============================================

insert into public.store_rewards (name, description, cost) values
  ('Dia de Descanso', 'Um dia livre de responsabilidades', 50),
  ('Refeição Especial', 'Peça sua comida favorita', 30),
  ('Entretenimento', 'Filme, série ou jogo', 40),
  ('Compra Pequena', 'Algo que você deseja', 100);
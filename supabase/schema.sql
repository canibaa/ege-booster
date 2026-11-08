-- ЕГЭ-бустер: облачные профили, прогресс и рейтинг
-- Выполнить целиком в Supabase → SQL Editor → New query → Run.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint username_length check (char_length(username) between 3 and 20),
  constraint username_format check (username ~ '^[A-Za-zА-Яа-яЁё0-9_-]+$')
);

create table if not exists public.user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  progress jsonb not null default '{}'::jsonb,
  points integer not null default 0 check (points >= 0),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.user_progress enable row level security;

drop policy if exists "Profiles are readable by authenticated users" on public.profiles;
create policy "Profiles are readable by authenticated users"
  on public.profiles for select to authenticated using (true);

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
  on public.profiles for insert to authenticated with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Users can read their own progress" on public.user_progress;
create policy "Users can read their own progress"
  on public.user_progress for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can create their own progress" on public.user_progress;
create policy "Users can create their own progress"
  on public.user_progress for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "Users can update their own progress" on public.user_progress;
create policy "Users can update their own progress"
  on public.user_progress for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.get_leaderboard(limit_count integer default 50)
returns table (username text, points integer, updated_at timestamptz)
language sql
stable
security invoker
set search_path = public
as $$
  select p.username, up.points, up.updated_at
  from public.profiles p
  join public.user_progress up on up.user_id = p.id
  order by up.points desc, up.updated_at asc
  limit greatest(1, least(coalesce(limit_count, 50), 100));
$$;

grant usage on schema public to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.user_progress to authenticated;
grant execute on function public.get_leaderboard(integer) to authenticated;

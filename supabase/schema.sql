create extension if not exists "pgcrypto";

create table if not exists public.leaderboard (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  score integer not null,
  level integer not null,
  systems_breached integer not null,
  created_at timestamptz not null default now()
);

create table if not exists public.runs (
  id uuid primary key default gen_random_uuid(),
  seed text not null,
  level integer not null,
  score integer not null,
  puzzles_solved integer not null,
  time_elapsed integer not null,
  systems_breached integer not null,
  death_reason text not null,
  created_at timestamptz not null default now()
);

alter table public.leaderboard enable row level security;
alter table public.runs enable row level security;

drop policy if exists "Anyone can read leaderboard" on public.leaderboard;
create policy "Anyone can read leaderboard"
on public.leaderboard
for select
to anon, authenticated
using (true);

drop policy if exists "Anyone can insert leaderboard" on public.leaderboard;
create policy "Anyone can insert leaderboard"
on public.leaderboard
for insert
to anon, authenticated
with check (true);

drop policy if exists "Anyone can read runs" on public.runs;
create policy "Anyone can read runs"
on public.runs
for select
to anon, authenticated
using (true);

drop policy if exists "Anyone can insert runs" on public.runs;
create policy "Anyone can insert runs"
on public.runs
for insert
to anon, authenticated
with check (true);

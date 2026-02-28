-- ============================================================
-- Whoop Integration Tables
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Whoop Connections (OAuth tokens per user)
create table whoop_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  connected boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table whoop_connections enable row level security;

create policy "Users can view own whoop connection"
  on whoop_connections for select using (auth.uid() = user_id);
create policy "Users can insert own whoop connection"
  on whoop_connections for insert with check (auth.uid() = user_id);
create policy "Users can update own whoop connection"
  on whoop_connections for update using (auth.uid() = user_id);

-- 2. Whoop Data (synced daily metrics)
create table whoop_data (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null default current_date,
  recovery_score numeric(4,1),
  hrv_rmssd numeric(6,1),
  resting_hr numeric(4,1),
  spo2_pct numeric(4,1),
  day_strain numeric(4,1),
  calories_burned integer,
  sleep_duration_min integer,
  sleep_efficiency numeric(4,1),
  created_at timestamptz default now(),
  unique(user_id, date)
);

alter table whoop_data enable row level security;

create policy "Users can view own whoop data"
  on whoop_data for select using (auth.uid() = user_id);
create policy "Users can insert own whoop data"
  on whoop_data for insert with check (auth.uid() = user_id);
create policy "Users can update own whoop data"
  on whoop_data for update using (auth.uid() = user_id);

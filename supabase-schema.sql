-- ============================================================
-- FitTrack Database Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Profiles (user settings & goals)
create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  calorie_goal integer default 2000,
  protein_goal integer default 150,
  carbs_goal integer default 250,
  fat_goal integer default 65,
  created_at timestamptz default now()
);

-- 2. Meals (logged meals)
create table meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  food_name text not null,
  calories integer not null,
  protein numeric not null,
  carbs numeric not null,
  fat numeric not null,
  date date default current_date,
  created_at timestamptz default now()
);

-- 3. Saved Meals (favorites for quick re-logging)
create table saved_meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  food_name text not null,
  calories integer not null,
  protein numeric not null,
  carbs numeric not null,
  fat numeric not null,
  frequency integer default 1,
  last_used timestamptz default now(),
  unique(user_id, food_name)
);

-- 4. Workout Entries (logged sets)
create table workout_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  exercise_name text not null,
  day_name text not null,
  week_number integer not null,
  set_number integer not null,
  weight numeric default 0,
  reps integer default 0,
  completed boolean default false,
  date date default current_date,
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security (RLS) — users only see their own data
-- ============================================================

alter table profiles enable row level security;
alter table meals enable row level security;
alter table saved_meals enable row level security;
alter table workout_entries enable row level security;

-- Profiles
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = user_id);
create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = user_id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = user_id);

-- Meals
create policy "Users can view own meals"
  on meals for select using (auth.uid() = user_id);
create policy "Users can insert own meals"
  on meals for insert with check (auth.uid() = user_id);
create policy "Users can delete own meals"
  on meals for delete using (auth.uid() = user_id);

-- Saved Meals
create policy "Users can view own saved meals"
  on saved_meals for select using (auth.uid() = user_id);
create policy "Users can insert own saved meals"
  on saved_meals for insert with check (auth.uid() = user_id);
create policy "Users can update own saved meals"
  on saved_meals for update using (auth.uid() = user_id);
create policy "Users can delete own saved meals"
  on saved_meals for delete using (auth.uid() = user_id);

-- Workout Entries
create policy "Users can view own workout entries"
  on workout_entries for select using (auth.uid() = user_id);
create policy "Users can insert own workout entries"
  on workout_entries for insert with check (auth.uid() = user_id);
create policy "Users can update own workout entries"
  on workout_entries for update using (auth.uid() = user_id);
create policy "Users can delete own workout entries"
  on workout_entries for delete using (auth.uid() = user_id);

-- ============================================================
-- Auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 5. Readiness Entries (daily readiness check-in)
-- ============================================================
create table readiness_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  sleep integer not null check (sleep between 1 and 5),
  stress integer not null check (stress between 1 and 5),
  soreness integer not null check (soreness between 1 and 5),
  motivation integer not null check (motivation between 1 and 5),
  energy integer not null check (energy between 1 and 5),
  score numeric(2,1) not null,
  date date default current_date,
  created_at timestamptz default now()
);

alter table readiness_entries enable row level security;

create policy "Users can view own readiness"
  on readiness_entries for select using (auth.uid() = user_id);
create policy "Users can insert own readiness"
  on readiness_entries for insert with check (auth.uid() = user_id);
create policy "Users can update own readiness"
  on readiness_entries for update using (auth.uid() = user_id);

-- ============================================================
-- 6. Body Weight Entries (daily weight & body fat tracking)
-- ============================================================
create table body_weight_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  weight_lbs numeric(5,1) not null,
  body_fat_pct numeric(4,1),
  notes text,
  date date default current_date,
  created_at timestamptz default now(),
  unique(user_id, date)
);

alter table body_weight_entries enable row level security;

create policy "Users can view own body weight"
  on body_weight_entries for select using (auth.uid() = user_id);
create policy "Users can insert own body weight"
  on body_weight_entries for insert with check (auth.uid() = user_id);
create policy "Users can update own body weight"
  on body_weight_entries for update using (auth.uid() = user_id);
create policy "Users can delete own body weight"
  on body_weight_entries for delete using (auth.uid() = user_id);

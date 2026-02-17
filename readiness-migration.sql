-- ============================================================
-- Readiness Entries Migration
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

CREATE TABLE readiness_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sleep integer NOT NULL CHECK (sleep BETWEEN 1 AND 5),
  stress integer NOT NULL CHECK (stress BETWEEN 1 AND 5),
  soreness integer NOT NULL CHECK (soreness BETWEEN 1 AND 5),
  motivation integer NOT NULL CHECK (motivation BETWEEN 1 AND 5),
  energy integer NOT NULL CHECK (energy BETWEEN 1 AND 5),
  score numeric(2,1) NOT NULL,
  date date DEFAULT current_date,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE readiness_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own readiness"
  ON readiness_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own readiness"
  ON readiness_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own readiness"
  ON readiness_entries FOR UPDATE USING (auth.uid() = user_id);

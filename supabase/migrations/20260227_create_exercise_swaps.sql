-- Exercise substitution tracking
CREATE TABLE exercise_swaps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  original_exercise_id TEXT NOT NULL,
  substitute_exercise_id TEXT NOT NULL,
  substitute_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, original_exercise_id)
);

ALTER TABLE exercise_swaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own swaps" ON exercise_swaps
  FOR ALL USING (auth.uid() = user_id);

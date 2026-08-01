-- Supabase Row Level Security policies for A/L Mastermind tables
-- Apply these policies after creating the tables.

-- Enable RLS for all user-specific tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recalls ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only SELECT/UPDATE their own profile and INSERT their own row
CREATE POLICY "Profiles can access own profile"
  ON public.profiles
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Papers: user_id must match authenticated user for all operations
CREATE POLICY "Papers are owned by user"
  ON public.papers
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Tasks: user_id must match authenticated user for all operations
CREATE POLICY "Tasks are owned by user"
  ON public.tasks
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Classes: user_id must match authenticated user for all operations
CREATE POLICY "Classes are owned by user"
  ON public.classes
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Recalls: user_id must match authenticated user for all operations
CREATE POLICY "Recalls are owned by user"
  ON public.recalls
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Optional: allow authenticated users to create a profile row on sign-up
CREATE POLICY "Allow profile insert for authenticated user"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Optional: public read-only access for any metadata tables can be added separately if needed.

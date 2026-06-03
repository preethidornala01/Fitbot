-- Drop existing tables to ensure clean recreation with correct column types
DROP TABLE IF EXISTS public.chats CASCADE;
DROP TABLE IF EXISTS public.bmi_records CASCADE;
DROP TABLE IF EXISTS public.fitness_profiles CASCADE;

-- 1. Create table for BMI records
CREATE TABLE public.bmi_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  weight NUMERIC NOT NULL,
  height NUMERIC NOT NULL,
  bmi NUMERIC NOT NULL,
  classification TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for bmi_records
ALTER TABLE public.bmi_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public access to bmi_records" ON public.bmi_records;
CREATE POLICY "Allow public access to bmi_records" ON public.bmi_records
  FOR ALL USING (true);


-- 2. Create table for fitness profiles
CREATE TABLE public.fitness_profiles (
  user_id TEXT PRIMARY KEY,
  name TEXT,
  age INTEGER,
  gender TEXT,
  height NUMERIC,
  weight NUMERIC,
  activity_level TEXT,
  goal TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for fitness_profiles
ALTER TABLE public.fitness_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public access to fitness_profiles" ON public.fitness_profiles;
CREATE POLICY "Allow public access to fitness_profiles" ON public.fitness_profiles
  FOR ALL USING (true);


-- 3. Create table for chats
CREATE TABLE public.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for chats
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public access to chats" ON public.chats;
CREATE POLICY "Allow public access to chats" ON public.chats
  FOR ALL USING (true);

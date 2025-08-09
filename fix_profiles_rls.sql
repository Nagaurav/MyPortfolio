-- Fix profiles table RLS for development
-- Run this in your Supabase SQL editor

-- Option 1: Disable RLS temporarily (for development only)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Option 2: Or create a more permissive policy (alternative approach)
-- DROP POLICY IF EXISTS "Development mock user can manage profiles" ON public.profiles;
-- CREATE POLICY "Development mock user can manage profiles"
--   ON public.profiles FOR ALL
--   USING (id = '550e8400-e29b-41d4-a716-446655440000')
--   WITH CHECK (id = '550e8400-e29b-41d4-a716-446655440000');

-- Option 3: Or allow any authenticated user to manage profiles (less secure)
-- DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
-- DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
-- CREATE POLICY "Any user can manage profiles"
--   ON public.profiles FOR ALL
--   USING (true)
--   WITH CHECK (true); 
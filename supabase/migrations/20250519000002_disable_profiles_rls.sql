/*
  # Temporarily disable RLS for profiles table in development
  
  1. Changes
    - Disable RLS on profiles table for development
    - This allows mock users to insert/update profiles
    - WARNING: This should only be used in development
*/

-- Temporarily disable RLS for development
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY; 
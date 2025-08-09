/*
  # Add missing columns to profiles table
  
  1. Changes
    - Add `name` column to `profiles` table (renamed from `full_name`)
    - Add `title` column to `profiles` table
    - Add `location` column to `profiles` table
    - Add `phone` column to `profiles` table
    - Drop `full_name` column after migrating data
*/

-- Add new columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS name text,
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS phone text;

-- Migrate data from full_name to name
UPDATE public.profiles 
SET name = full_name 
WHERE full_name IS NOT NULL AND name IS NULL;

-- Drop the old full_name column
ALTER TABLE public.profiles DROP COLUMN IF EXISTS full_name; 
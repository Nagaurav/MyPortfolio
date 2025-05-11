/*
  # Add user preferences table
  
  1. New Tables
    - `user_preferences`
      - `user_id` (uuid, primary key)
      - `theme` (text, check constraint: 'light' or 'dark')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create the user_preferences table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    theme TEXT NOT NULL CHECK (theme IN ('light', 'dark')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_preferences;
    DROP POLICY IF EXISTS "Users can read own preferences" ON public.user_preferences;
    DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
EXCEPTION
    WHEN undefined_object THEN 
        NULL;
END $$;

-- Create policies
CREATE POLICY "Users can insert own preferences"
    ON public.user_preferences
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own preferences"
    ON public.user_preferences
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
    ON public.user_preferences
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create or replace trigger for updating the updated_at timestamp
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
/*
  # Add experience table
  
  1. New Tables
    - `experiences`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `company` (text)
      - `location` (text)
      - `type` (text) - 'internship', 'freelance', 'full-time', etc.
      - `start_date` (date)
      - `end_date` (date, nullable for current positions)
      - `current` (boolean)
      - `description` (text)
      - `technologies` (text[])
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create experiences table
CREATE TABLE IF NOT EXISTS public.experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  company text NOT NULL,
  location text NOT NULL,
  type text NOT NULL,
  start_date date NOT NULL,
  end_date date,
  current boolean DEFAULT false,
  description text NOT NULL,
  technologies text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public experiences are viewable by everyone"
  ON public.experiences FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own experiences"
  ON public.experiences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own experiences"
  ON public.experiences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own experiences"
  ON public.experiences FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updating updated_at
CREATE TRIGGER update_experiences_updated_at
  BEFORE UPDATE ON public.experiences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
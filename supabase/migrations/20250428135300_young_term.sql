/*
  # Portfolio Database Schema

  1. New Tables
    - Projects
    - Skills
    - Certificates
    - Resumes
    - Contacts

  2. Security
    - Enable RLS
    - Add policies for each table
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  short_description text,
  tags text[],
  image_url text,
  github_url text,
  live_url text,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create skills table
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  proficiency integer CHECK (proficiency BETWEEN 1 AND 10),
  icon_name text,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  issuer text NOT NULL,
  issue_date date NOT NULL,
  expiry_date date,
  credential_url text,
  certificate_url text,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  version text NOT NULL,
  file_url text NOT NULL,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Projects policies
  DROP POLICY IF EXISTS "Public projects are viewable by everyone" ON projects;
  DROP POLICY IF EXISTS "Users can manage their own projects" ON projects;
  
  -- Skills policies
  DROP POLICY IF EXISTS "Public skills are viewable by everyone" ON skills;
  DROP POLICY IF EXISTS "Users can manage their own skills" ON skills;
  
  -- Certificates policies
  DROP POLICY IF EXISTS "Public certificates are viewable by everyone" ON certificates;
  DROP POLICY IF EXISTS "Users can manage their own certificates" ON certificates;
  
  -- Resumes policies
  DROP POLICY IF EXISTS "Public resumes are viewable by everyone" ON resumes;
  DROP POLICY IF EXISTS "Users can manage their own resumes" ON resumes;
  
  -- Contacts policies
  DROP POLICY IF EXISTS "Anyone can create contact messages" ON contacts;
  DROP POLICY IF EXISTS "Users can view contact messages" ON contacts;
  DROP POLICY IF EXISTS "Users can manage contact messages" ON contacts;
END $$;

-- Create policies for projects
CREATE POLICY "Public projects are viewable by everyone" 
  ON projects FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage their own projects" 
  ON projects FOR ALL 
  USING (auth.uid() = user_id);

-- Create policies for skills
CREATE POLICY "Public skills are viewable by everyone" 
  ON skills FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage their own skills" 
  ON skills FOR ALL 
  USING (auth.uid() = user_id);

-- Create policies for certificates
CREATE POLICY "Public certificates are viewable by everyone" 
  ON certificates FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage their own certificates" 
  ON certificates FOR ALL 
  USING (auth.uid() = user_id);

-- Create policies for resumes
CREATE POLICY "Public resumes are viewable by everyone" 
  ON resumes FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage their own resumes" 
  ON resumes FOR ALL 
  USING (auth.uid() = user_id);

-- Create policies for contacts
CREATE POLICY "Anyone can create contact messages" 
  ON contacts FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can view contact messages" 
  ON contacts FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage contact messages" 
  ON contacts FOR UPDATE 
  USING (auth.uid() = user_id);
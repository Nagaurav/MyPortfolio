/*
  # Create portfolio tables
  
  1. New Tables
    - `profiles`: User profile information
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `full_name` (text)
      - `bio` (text)
      - `github_url` (text)
      - `linkedin_url` (text)
      - `twitter_url` (text)
      - `avatar_url` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `projects`: Portfolio projects
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `short_description` (text)
      - `description` (text)
      - `image_url` (text)
      - `github_url` (text)
      - `live_url` (text)
      - `featured` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `skills`: User skills
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text)
      - `category` (text)
      - `proficiency` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `certificates`: User certificates
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `issuer` (text)
      - `issue_date` (date)
      - `expiry_date` (date)
      - `credential_url` (text)
      - `certificate_url` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `resumes`: User resumes
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `file_url` (text)
      - `is_default` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `contact_messages`: Contact form messages
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `subject` (text)
      - `message` (text)
      - `read` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text UNIQUE,
    full_name text,
    bio text,
    github_url text,
    linkedin_url text,
    twitter_url text,
    avatar_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create projects table
CREATE TABLE public.projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    short_description text,
    description text,
    image_url text,
    github_url text,
    live_url text,
    featured boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create skills table
CREATE TABLE public.skills (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    category text NOT NULL,
    proficiency integer CHECK (proficiency BETWEEN 1 AND 5),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create certificates table
CREATE TABLE public.certificates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    issuer text NOT NULL,
    issue_date date NOT NULL,
    expiry_date date,
    credential_url text,
    certificate_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create resumes table
CREATE TABLE public.resumes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    file_url text NOT NULL,
    is_default boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create contact messages table
CREATE TABLE public.contact_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text NOT NULL,
    subject text NOT NULL,
    message text NOT NULL,
    read boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Profiles
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Projects
CREATE POLICY "Public projects are viewable by everyone"
    ON public.projects FOR SELECT
    USING (true);

CREATE POLICY "Users can insert own projects"
    ON public.projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
    ON public.projects FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
    ON public.projects FOR DELETE
    USING (auth.uid() = user_id);

-- Skills
CREATE POLICY "Public skills are viewable by everyone"
    ON public.skills FOR SELECT
    USING (true);

CREATE POLICY "Users can insert own skills"
    ON public.skills FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skills"
    ON public.skills FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own skills"
    ON public.skills FOR DELETE
    USING (auth.uid() = user_id);

-- Certificates
CREATE POLICY "Public certificates are viewable by everyone"
    ON public.certificates FOR SELECT
    USING (true);

CREATE POLICY "Users can insert own certificates"
    ON public.certificates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own certificates"
    ON public.certificates FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own certificates"
    ON public.certificates FOR DELETE
    USING (auth.uid() = user_id);

-- Resumes
CREATE POLICY "Public resumes are viewable by everyone"
    ON public.resumes FOR SELECT
    USING (true);

CREATE POLICY "Users can insert own resumes"
    ON public.resumes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes"
    ON public.resumes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own resumes"
    ON public.resumes FOR DELETE
    USING (auth.uid() = user_id);

-- Contact Messages
CREATE POLICY "Anyone can insert contact messages"
    ON public.contact_messages FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Only authenticated users can view contact messages"
    ON public.contact_messages FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only authenticated users can update contact messages"
    ON public.contact_messages FOR UPDATE
    USING (auth.uid() IS NOT NULL);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skills_updated_at
    BEFORE UPDATE ON public.skills
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certificates_updated_at
    BEFORE UPDATE ON public.certificates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resumes_updated_at
    BEFORE UPDATE ON public.resumes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
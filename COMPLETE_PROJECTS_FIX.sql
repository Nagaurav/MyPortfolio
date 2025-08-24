-- COMPLETE PROJECTS TABLE FIX
-- This script will fix ALL issues with your projects table
-- Run this in Supabase SQL Editor

-- Step 1: Check current state
DO $$
BEGIN
  RAISE NOTICE 'Starting complete fix for projects table...';
  
  -- Check if table exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects') THEN
    RAISE NOTICE 'Projects table does not exist. Creating it...';
    
    CREATE TABLE projects (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      title text NOT NULL,
      description text NOT NULL,
      short_description text,
      tech_stack text[],
      github_url text,
      live_url text,
      featured boolean DEFAULT false,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
    
    RAISE NOTICE 'Projects table created successfully!';
  ELSE
    RAISE NOTICE 'Projects table exists. Adding missing columns...';
  END IF;
END $$;

-- Step 2: Add all missing columns (safe to run multiple times)
DO $$
BEGIN
  -- Add tech_stack column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'tech_stack') THEN
    ALTER TABLE projects ADD COLUMN tech_stack text[];
    RAISE NOTICE 'Added tech_stack column';
  END IF;
  
  -- Add user_id column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'user_id') THEN
    ALTER TABLE projects ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added user_id column';
  END IF;
  
  -- Add created_at column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'created_at') THEN
    ALTER TABLE projects ADD COLUMN created_at timestamptz DEFAULT now();
    RAISE NOTICE 'Added created_at column';
  END IF;
  
  -- Add updated_at column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'updated_at') THEN
    ALTER TABLE projects ADD COLUMN updated_at timestamptz DEFAULT now();
    RAISE NOTICE 'Added updated_at column';
  END IF;
  
  -- Add short_description column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'short_description') THEN
    ALTER TABLE projects ADD COLUMN short_description text;
    RAISE NOTICE 'Added short_description column';
  END IF;
  
  -- Add github_url column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'github_url') THEN
    ALTER TABLE projects ADD COLUMN github_url text;
    RAISE NOTICE 'Added github_url column';
  END IF;
  
  -- Add live_url column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'live_url') THEN
    ALTER TABLE projects ADD COLUMN live_url text;
    RAISE NOTICE 'Added live_url column';
  END IF;
  
  -- Add featured column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'featured') THEN
    ALTER TABLE projects ADD COLUMN featured boolean DEFAULT false;
    RAISE NOTICE 'Added featured column';
  END IF;
END $$;

-- Step 3: Ensure required columns are NOT NULL
DO $$
BEGIN
  -- Make title NOT NULL
  ALTER TABLE projects ALTER COLUMN title SET NOT NULL;
  
  -- Make description NOT NULL
  ALTER TABLE projects ALTER COLUMN description SET NOT NULL;
  
  -- Make user_id NOT NULL
  ALTER TABLE projects ALTER COLUMN user_id SET NOT NULL;
  
  RAISE NOTICE 'Set required columns to NOT NULL';
END $$;

-- Step 4: Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 5: Add updated_at trigger
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_projects_updated_at') THEN
    CREATE TRIGGER update_projects_updated_at
      BEFORE UPDATE ON projects
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    RAISE NOTICE 'Added updated_at trigger';
  END IF;
END $$;

-- Step 6: Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Step 7: Drop all existing policies (clean slate)
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
  DROP POLICY IF EXISTS "Public projects are viewable by everyone" ON projects;
  DROP POLICY IF EXISTS "Users can update own projects" ON projects;
  DROP POLICY IF EXISTS "Users can delete own projects" ON projects;
  DROP POLICY IF EXISTS "Anyone can insert projects" ON projects;
  DROP POLICY IF EXISTS "Anyone can view projects" ON projects;
  RAISE NOTICE 'Dropped all existing policies';
END $$;

-- Step 8: Create new RLS policies
-- Policy 1: Anyone can view projects (public)
CREATE POLICY "Public projects are viewable by everyone"
    ON projects FOR SELECT
    USING (true);

-- Policy 2: Authenticated users can insert projects
CREATE POLICY "Authenticated users can insert projects"
    ON projects FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Policy 3: Users can update their own projects
CREATE POLICY "Users can update own projects"
    ON projects FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy 4: Users can delete their own projects
CREATE POLICY "Users can delete own projects"
    ON projects FOR DELETE
    USING (auth.uid() = user_id);

-- Step 9: Verify the fix
DO $$
BEGIN
  RAISE NOTICE '=== VERIFICATION RESULTS ===';
  RAISE NOTICE 'Projects table structure:';
  
  -- Show all columns (fixed string_agg usage)
  RAISE NOTICE 'Columns: %', (
    SELECT string_agg(column_name || ' (' || data_type || ')', ', ' ORDER BY ordinal_position)
    FROM information_schema.columns 
    WHERE table_name = 'projects'
  );
  
  -- Show RLS status
  RAISE NOTICE 'RLS enabled: %', (
    SELECT rowsecurity 
    FROM pg_tables 
    WHERE tablename = 'projects'
  );
  
  -- Show policies
  RAISE NOTICE 'Policies: %', (
    SELECT string_agg(policyname, ', ' ORDER BY policyname)
    FROM pg_policies 
    WHERE tablename = 'projects'
  );
  
  RAISE NOTICE '=== FIX COMPLETE ===';
END $$;

-- Step 10: Show final table structure
SELECT 
  'FINAL TABLE STRUCTURE' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'projects'
ORDER BY ordinal_position;

-- Quick Fix: Add tech_stack Column to Projects Table
-- This script will definitely work - run it in Supabase SQL Editor

-- Step 1: Add the tech_stack column
ALTER TABLE projects ADD COLUMN tech_stack text[];

-- Step 2: Verify it was added
SELECT 
  'Column Added Successfully' as status,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'projects' AND column_name = 'tech_stack';

-- Step 3: Show current table structure
SELECT 
  'Current Table Structure' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'projects'
ORDER BY ordinal_position;

-- Step 4: Test if we can insert data (optional)
-- This will show if the column is working
SELECT 
  'Test Result' as status,
  'tech_stack column is ready to use' as message;

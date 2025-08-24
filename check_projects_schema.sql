-- Diagnostic Script: Check Projects Table Schema
-- Run this in Supabase SQL Editor to see what's currently in your database

-- 1. Check if projects table exists
SELECT 
  'Table Exists' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects') 
    THEN 'YES' 
    ELSE 'NO' 
  END as result;

-- 2. Check current table structure
SELECT 
  'Current Schema' as check_type,
  column_name,
  data_type,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns 
WHERE table_name = 'projects'
ORDER BY ordinal_position;

-- 3. Check if specific columns exist
SELECT 
  'Column Check' as check_type,
  column_name,
  CASE 
    WHEN column_name IS NOT NULL THEN 'EXISTS' 
    ELSE 'MISSING' 
  END as status
FROM (
  SELECT 'id' as column_name
  UNION ALL SELECT 'title'
  UNION ALL SELECT 'description'
  UNION ALL SELECT 'short_description'
  UNION ALL SELECT 'tech_stack'
  UNION ALL SELECT 'github_url'
  UNION ALL SELECT 'live_url'
  UNION ALL SELECT 'featured'
  UNION ALL SELECT 'user_id'
  UNION ALL SELECT 'created_at'
  UNION ALL SELECT 'updated_at'
) required_columns
LEFT JOIN information_schema.columns c 
  ON c.column_name = required_columns.column_name 
  AND c.table_name = 'projects'
ORDER BY required_columns.column_name;

-- 4. Check table constraints and policies
SELECT 
  'Constraints' as check_type,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'projects';

-- 5. Check RLS policies
SELECT 
  'RLS Policies' as check_type,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'projects';

-- 6. Check if RLS is enabled
SELECT 
  'RLS Status' as check_type,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'projects';

-- 7. Check sample data (if any exists)
SELECT 
  'Sample Data' as check_type,
  COUNT(*) as total_projects,
  COUNT(CASE WHEN tech_stack IS NOT NULL THEN 1 END) as projects_with_tech_stack
FROM projects;

-- 8. Check for any errors in recent logs (if accessible)
-- Note: This might not work depending on your Supabase plan
SELECT 
  'Recent Activity' as check_type,
  'Check Supabase Dashboard → Database → Logs for recent errors' as note;

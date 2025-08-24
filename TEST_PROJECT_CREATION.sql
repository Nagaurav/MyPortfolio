-- TEST PROJECT CREATION
-- Run this after the COMPLETE_PROJECTS_FIX.sql to verify everything works

-- Test 1: Check if we can insert a test project
DO $$
DECLARE
  test_user_id uuid;
  inserted_project_id uuid;
BEGIN
  -- Get a test user ID (first user in auth.users)
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;
  
  IF test_user_id IS NULL THEN
    RAISE NOTICE 'No users found in auth.users table';
    RETURN;
  END IF;
  
  RAISE NOTICE 'Testing with user ID: %', test_user_id;
  
  -- Try to insert a test project
  INSERT INTO projects (
    user_id,
    title,
    description,
    short_description,
    tech_stack,
    github_url,
    live_url,
    featured
  ) VALUES (
    test_user_id,
    'Test Project',
    'This is a test project to verify the database is working correctly.',
    'A test project for verification',
    ARRAY['React', 'TypeScript', 'Supabase'],
    'https://github.com/test/project',
    'https://test-project.com',
    false
  ) RETURNING id INTO inserted_project_id;
  
  RAISE NOTICE 'Test project inserted successfully with ID: %', inserted_project_id;
  
  -- Verify the project was inserted
  IF EXISTS (SELECT 1 FROM projects WHERE id = inserted_project_id) THEN
    RAISE NOTICE '✅ PROJECT CREATION TEST PASSED!';
  ELSE
    RAISE NOTICE '❌ PROJECT CREATION TEST FAILED!';
  END IF;
  
  -- Clean up test data
  DELETE FROM projects WHERE id = inserted_project_id;
  RAISE NOTICE 'Test project cleaned up';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ PROJECT CREATION TEST FAILED: %', SQLERRM;
END $$;

-- Test 2: Show current projects table state
SELECT 
  'CURRENT STATE' as info,
  COUNT(*) as total_projects,
  COUNT(CASE WHEN tech_stack IS NOT NULL THEN 1 END) as projects_with_tech_stack,
  COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as projects_with_user_id
FROM projects;

-- Test 3: Verify all required columns exist
SELECT 
  'COLUMN VERIFICATION' as info,
  column_name,
  data_type,
  is_nullable,
  CASE 
    WHEN column_name IN ('id', 'user_id', 'title', 'description') THEN 'REQUIRED'
    ELSE 'OPTIONAL'
  END as importance
FROM information_schema.columns 
WHERE table_name = 'projects'
ORDER BY 
  CASE WHEN column_name IN ('id', 'user_id', 'title', 'description') THEN 1 ELSE 2 END,
  ordinal_position;

-- Test 4: Check RLS policies
SELECT 
  'RLS POLICIES' as info,
  policyname,
  cmd,
  permissive,
  CASE 
    WHEN cmd = 'SELECT' THEN 'READ ACCESS'
    WHEN cmd = 'INSERT' THEN 'CREATE ACCESS'
    WHEN cmd = 'UPDATE' THEN 'EDIT ACCESS'
    WHEN cmd = 'DELETE' THEN 'DELETE ACCESS'
    ELSE 'OTHER'
  END as access_type
FROM pg_policies 
WHERE tablename = 'projects'
ORDER BY cmd, policyname;

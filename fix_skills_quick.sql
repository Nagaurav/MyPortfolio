-- Quick Fix for Skills User ID Issue
-- Run this in your Supabase SQL Editor

-- Step 1: Check your current user ID
SELECT id, email FROM profiles WHERE email = 'your-email@example.com' LIMIT 1;

-- Step 2: Check current skills count
SELECT COUNT(*) as total_skills FROM skills;

-- Step 3: Update skills to use your user ID
-- Replace 'YOUR_USER_ID_HERE' with the ID from Step 1
UPDATE skills 
SET user_id = 'YOUR_USER_ID_HERE'
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';

-- Step 4: Verify the update
SELECT COUNT(*) as skills_with_your_id FROM skills WHERE user_id = 'YOUR_USER_ID_HERE';

-- Step 5: Test if skills are now visible
SELECT name, category, proficiency FROM skills LIMIT 5;

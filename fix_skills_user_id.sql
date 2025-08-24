-- Fix Skills User ID Issue
-- Run this in your Supabase SQL Editor

-- Step 1: Check what user IDs exist in your profiles table
SELECT id, email, created_at FROM profiles ORDER BY created_at DESC LIMIT 5;

-- Step 2: Check current skills and their user IDs
SELECT COUNT(*) as total_skills, user_id FROM skills GROUP BY user_id;

-- Step 3: Update skills to use your actual user ID
-- Replace 'YOUR_ACTUAL_USER_ID_HERE' with the ID from Step 1
UPDATE skills 
SET user_id = 'YOUR_ACTUAL_USER_ID_HERE'
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';

-- Step 4: Verify the update worked
SELECT COUNT(*) as total_skills, user_id FROM skills GROUP BY user_id;

-- Step 5: Check if skills are now visible
SELECT name, category, proficiency FROM skills LIMIT 10;

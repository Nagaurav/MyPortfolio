/*
  # Fix Skills User ID
  
  This migration updates the skills table to use the actual user ID
  instead of the mock user ID from the seed data.
  
  Note: You need to replace 'YOUR_ACTUAL_USER_ID' with your real user ID
  from the profiles table.
*/

-- First, let's see what user IDs exist in the profiles table
-- SELECT id, email FROM profiles LIMIT 5;

-- Update the skills to use your actual user ID
-- Replace 'YOUR_ACTUAL_USER_ID' with your real user ID from the profiles table
UPDATE skills 
SET user_id = (
  SELECT id FROM profiles 
  WHERE email = 'your-email@example.com'  -- Replace with your actual email
  LIMIT 1
)
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';

-- Alternative: If you want to use a specific user ID directly
-- UPDATE skills 
-- SET user_id = 'your-actual-uuid-here'
-- WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';

-- Verify the update
-- SELECT COUNT(*) as total_skills, user_id FROM skills GROUP BY user_id;

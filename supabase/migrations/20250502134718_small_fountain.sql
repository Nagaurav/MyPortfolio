/*
  # Add is_active column to resumes table

  1. Changes
    - Add `is_active` column to `resumes` table with boolean type and default value of false
    - Add constraint to ensure only one resume can be active at a time using a partial unique index

  2. Notes
    - The partial unique index ensures that only one resume can have is_active = true
    - Default value of false ensures new resumes are not automatically set as active
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'resumes' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE resumes ADD COLUMN is_active boolean DEFAULT false;
  END IF;
END $$;

-- Create a partial unique index to ensure only one resume can be active
CREATE UNIQUE INDEX IF NOT EXISTS resumes_active_unique ON resumes (user_id) WHERE (is_active = true);
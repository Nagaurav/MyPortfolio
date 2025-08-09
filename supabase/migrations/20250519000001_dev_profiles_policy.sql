/*
  # Add development-friendly policy for profiles table
  
  1. Changes
    - Add policy to allow mock user (550e8400-e29b-41d4-a716-446655440000) to insert/update profiles
    - This is for development purposes only
*/

-- Add development policy for mock user
CREATE POLICY "Development mock user can manage profiles"
  ON public.profiles FOR ALL
  USING (id = '550e8400-e29b-41d4-a716-446655440000')
  WITH CHECK (id = '550e8400-e29b-41d4-a716-446655440000'); 
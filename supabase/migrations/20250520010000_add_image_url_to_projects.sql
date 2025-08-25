-- Add image_url column to projects for storing public image URLs
-- Safe to run multiple times

alter table if exists public.projects
add column if not exists image_url text;

-- Optional: add a simple check constraint for URL-ish values (commented out)
-- alter table public.projects
--   add constraint projects_image_url_format_chk
--   check (image_url is null or image_url ~* '^https?://');



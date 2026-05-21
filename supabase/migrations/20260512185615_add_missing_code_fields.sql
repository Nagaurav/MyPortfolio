-- Add columns that the application code reads/writes but were missing from the schema.
--
--   projects.category          -- filter chip + card label on public/projects.tsx
--   experiences.key_achievements -- bullet list on public/experience.tsx
--   experiences.position       -- fallback for `title` on public/experience.tsx and home.tsx

alter table public.projects
  add column if not exists category text;

alter table public.experiences
  add column if not exists key_achievements text[],
  add column if not exists position text;

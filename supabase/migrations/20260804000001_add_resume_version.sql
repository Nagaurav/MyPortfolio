-- Add the `version` column the admin resume form has always been sending.
--
-- src/pages/admin/resume.tsx registers `version` as a REQUIRED form field and
-- renders "Version: {resume.version}" in the list, but the column was never
-- created. PostgREST rejects inserts/updates that reference an unknown column,
-- so saving a resume has always failed and the list value was always blank.
--
-- Nullable with no default: existing rows stay valid, and the app treats a
-- missing version as an empty string.

alter table public.resumes
  add column if not exists version text;

comment on column public.resumes.version is
  'Human-readable resume version label, e.g. "v2.1" or "2026 - Backend focus".';

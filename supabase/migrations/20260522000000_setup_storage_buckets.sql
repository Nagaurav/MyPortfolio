-- Set up the storage buckets the admin UI uploads to, plus their access policies.
--
-- The app uploads to four buckets (avatars, projects, certificates, resumes) via the
-- authenticated client, but no migration ever created them or their storage.objects
-- policies. A missing bucket or a missing INSERT policy makes uploads fail with HTTP 400.
--
-- This migration is idempotent:
--   1. Create each bucket as public (so getPublicUrl works for the portfolio site).
--   2. Allow public SELECT (read) on objects in these buckets.
--   3. Allow authenticated users to INSERT / UPDATE / DELETE objects in these buckets.
--      (Upsert needs INSERT + SELECT + UPDATE; public read covers SELECT.)

-- 1. Buckets ----------------------------------------------------------------
insert into storage.buckets (id, name, public)
values
  ('avatars',      'avatars',      true),
  ('projects',     'projects',     true),
  ('certificates', 'certificates', true),
  ('resumes',      'resumes',      true)
on conflict (id) do update set public = excluded.public;

-- 2. Public read ------------------------------------------------------------
drop policy if exists "Public read access to portfolio buckets" on storage.objects;
create policy "Public read access to portfolio buckets"
  on storage.objects
  for select
  to public
  using (bucket_id in ('avatars', 'projects', 'certificates', 'resumes'));

-- 3. Authenticated write ----------------------------------------------------
drop policy if exists "Authenticated insert to portfolio buckets" on storage.objects;
create policy "Authenticated insert to portfolio buckets"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id in ('avatars', 'projects', 'certificates', 'resumes'));

drop policy if exists "Authenticated update to portfolio buckets" on storage.objects;
create policy "Authenticated update to portfolio buckets"
  on storage.objects
  for update
  to authenticated
  using (bucket_id in ('avatars', 'projects', 'certificates', 'resumes'))
  with check (bucket_id in ('avatars', 'projects', 'certificates', 'resumes'));

drop policy if exists "Authenticated delete from portfolio buckets" on storage.objects;
create policy "Authenticated delete from portfolio buckets"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id in ('avatars', 'projects', 'certificates', 'resumes'));

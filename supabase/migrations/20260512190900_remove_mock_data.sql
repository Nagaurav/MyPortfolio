-- Remove dev-only mock data and policies so only real, authenticated data is presented.
--
-- 1. Delete any rows tied to the mock user UUID used by the dev seed migration.
-- 2. Drop the dev-only "mock user can manage profiles" policy.
-- 3. Re-enable RLS on profiles (was disabled for dev convenience).
--    Existing user-scoped policies (insert/update own profile, public SELECT)
--    remain active once RLS is re-enabled.

do $$
declare
  mock_id constant uuid := '550e8400-e29b-41d4-a716-446655440000';
begin
  delete from public.skills        where user_id = mock_id;
  delete from public.projects      where user_id = mock_id;
  delete from public.certificates  where user_id = mock_id;
  delete from public.resumes       where user_id = mock_id;
  delete from public.experiences   where user_id = mock_id;
  delete from public.contacts      where user_id = mock_id;
end $$;

drop policy if exists "Development mock user can manage profiles" on public.profiles;

alter table public.profiles enable row level security;

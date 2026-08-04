-- Make submitted contact messages reachable from the admin panel.
--
-- The public contact form posts through the contact-form edge function, which
-- inserts {name, email, subject, message} anonymously -- it never sets user_id,
-- and the column is nullable with no default. The read policy was
-- `USING (auth.uid() = user_id)`, and `auth.uid() = NULL` evaluates to NULL
-- rather than true, so RLS filtered out every row: the admin inbox was always
-- empty. There was also no DELETE policy at all, so "delete message" removed
-- zero rows and still reported success.
--
-- This is a single-owner portfolio: the only account that can authenticate is
-- the site owner, so scoping these to `authenticated` is both correct and what
-- the original schema intended ("Only authenticated users can view contact
-- messages"). Anonymous INSERT stays open so the public form keeps working.

-- Clear out every historical name these policies have had, so this is idempotent
-- regardless of which migrations a given environment has applied.
drop policy if exists "Users can view contact messages"                    on public.contacts;
drop policy if exists "Users can manage contact messages"                  on public.contacts;
drop policy if exists "Only authenticated users can view contact messages" on public.contacts;
drop policy if exists "Only authenticated users can update contact messages" on public.contacts;
drop policy if exists "Authenticated users can view contact messages"      on public.contacts;
drop policy if exists "Authenticated users can update contact messages"    on public.contacts;
drop policy if exists "Authenticated users can delete contact messages"    on public.contacts;

create policy "Authenticated users can view contact messages"
  on public.contacts for select
  to authenticated
  using (true);

create policy "Authenticated users can update contact messages"
  on public.contacts for update
  to authenticated
  using (true)
  with check (true);

-- Previously missing entirely, which is why deletes silently affected 0 rows.
create policy "Authenticated users can delete contact messages"
  on public.contacts for delete
  to authenticated
  using (true);

-- Anonymous submissions must keep working; re-assert the INSERT policy in case
-- an environment lost it.
drop policy if exists "Anyone can create contact messages" on public.contacts;
create policy "Anyone can create contact messages"
  on public.contacts for insert
  to anon, authenticated
  with check (true);

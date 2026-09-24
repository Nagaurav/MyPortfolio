-- Reshape a project row around the six questions the project page actually answers.
--
-- The admin form had grown a column per idea -- description, short_description,
-- role, outcome, category -- without any of them asking a question a reader has.
-- The form is now driven by a fixed template:
--
--   What it does                  -> description      (already existed)
--   Who uses it                   -> audience         (new)
--   Stack                         -> tech_stack       (already existed)
--   What I personally built       -> contributions    (already existed)
--   The hardest technical problem -> hardest_problem  (new)
--   What's shipped vs still local -> shipping_status + shipping_note (new)
--
-- `short_description`, `role`, `outcome` and `category` are deliberately NOT
-- dropped. They hold content on existing rows and dropping a column is not
-- reversible; they simply stop being edited. Drop them in a later migration once
-- the rows that use them have been migrated by hand.
--
-- "Shipped vs local" is two columns rather than one blob of prose because the
-- status drives a badge (and, later, a filter) while the note is free text. A
-- check constraint keeps the status to the three values the badge can render --
-- an enum type would need its own DROP TYPE dance to stay idempotent.

alter table public.projects
  add column if not exists audience         text,
  add column if not exists hardest_problem  text,
  add column if not exists shipping_status  text,
  add column if not exists shipping_note    text;

-- Idempotent: re-running with a changed value list replaces the old constraint.
alter table public.projects
  drop constraint if exists projects_shipping_status_check;

alter table public.projects
  add constraint projects_shipping_status_check
  check (shipping_status is null or shipping_status in ('shipped', 'partial', 'local'));

comment on column public.projects.audience is
  'Who actually uses this -- real users, a client, a team, or just the author so far.';

comment on column public.projects.hardest_problem is
  'The hardest technical problem on this project and how it was solved.';

comment on column public.projects.shipping_status is
  'One of shipped / partial / local, or null when unstated. Rendered as a badge.';

comment on column public.projects.shipping_note is
  'Free-text detail on what is deployed and what still only runs locally.';

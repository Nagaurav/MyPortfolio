-- Record what the author actually did on each project.
--
-- A project row could say what the thing is (`description`) and what it was
-- built with (`tech_stack`), but not what the author's own part in it was. On
-- team, client or freelance work those are very different claims, and a single
-- job title on the profile cannot answer it per project.
--
-- `role` is one line ("Solo developer", "Frontend lead"). `contributions` is an
-- ordered list of what the author personally built, stored as text[] so the
-- project page renders real bullets instead of parsing a blob of prose.

alter table public.projects
  add column if not exists role text,
  add column if not exists contributions text[] not null default '{}';

comment on column public.projects.role is
  'The author''s role on this project, e.g. "Solo developer" or "Frontend lead".';

comment on column public.projects.contributions is
  'Ordered list of what the author personally built. Rendered as bullets on the project detail page.';

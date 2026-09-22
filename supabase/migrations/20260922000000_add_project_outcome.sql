-- One line on what the project actually achieved.
--
-- `description` says what a thing is and `contributions` says what was built,
-- but neither says whether it worked. A result -- "live on Google Play",
-- "load-tested to 1,000 concurrent students", "page 1 for key categories" -- is
-- the line a reader remembers, so it gets its own field and its own callout on
-- the card rather than being buried mid-paragraph.

alter table public.projects
  add column if not exists outcome text;

comment on column public.projects.outcome is
  'One-line result or standout fact, rendered as a highlighted callout on project cards.';

-- Allow a project to carry more than one image.
--
-- `projects.image_url` holds a single URL, so the admin form could only ever
-- attach one image per project. This adds an ordered gallery alongside it.
--
-- `image_url` is deliberately kept and treated as the cover image: the project
-- cards on the home and projects pages already read it, so keeping it in sync
-- with image_urls[0] means those views need no change and older rows keep
-- rendering exactly as before.

alter table public.projects
  add column if not exists image_urls text[] not null default '{}';

comment on column public.projects.image_urls is
  'Ordered gallery for the project. image_urls[1] is the cover and is mirrored into image_url.';

-- Backfill: any project that already has a cover starts with a one-image gallery.
update public.projects
set image_urls = array[image_url]
where image_url is not null
  and image_url <> ''
  and cardinality(image_urls) = 0;

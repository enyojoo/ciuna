-- Public expert profile URLs: /experts/:slug (slug stored normalized; UUID in path still supported via API).

alter table expert_profiles add column if not exists slug text;

create unique index if not exists expert_profiles_slug_unique on expert_profiles (slug) where slug is not null and length(trim(slug)) > 0;

comment on column expert_profiles.slug is 'URL segment for /experts/:slug (lowercase kebab-case); optional legacy rows may backfill from display_name.';

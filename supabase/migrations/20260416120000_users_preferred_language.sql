alter table public.users
add column if not exists preferred_language text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'users_preferred_language_check'
  ) then
    alter table public.users
    add constraint users_preferred_language_check
    check (preferred_language is null or preferred_language in ('en', 'ru', 'fr', 'es'));
  end if;
end $$;

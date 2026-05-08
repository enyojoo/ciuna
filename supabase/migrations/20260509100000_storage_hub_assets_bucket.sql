-- Dedicated public bucket for hub product images and hub service line icons (clearer than reusing payment-qr-codes).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'hub-assets',
  'hub-assets',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "hub_assets_select_public" on storage.objects;
drop policy if exists "hub_assets_insert_authenticated" on storage.objects;
drop policy if exists "hub_assets_update_authenticated" on storage.objects;
drop policy if exists "hub_assets_delete_authenticated" on storage.objects;

create policy "hub_assets_select_public"
  on storage.objects for select
  using (bucket_id = 'hub-assets');

create policy "hub_assets_insert_authenticated"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'hub-assets');

create policy "hub_assets_update_authenticated"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'hub-assets')
  with check (bucket_id = 'hub-assets');

create policy "hub_assets_delete_authenticated"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'hub-assets');

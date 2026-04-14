-- Featured flag for Hub catalog ordering (Office + web)

alter table public.hub_products
  add column if not exists is_featured boolean not null default false;

create index if not exists idx_hub_products_live_featured_updated
  on public.hub_products using btree (status, is_featured desc, updated_at desc);

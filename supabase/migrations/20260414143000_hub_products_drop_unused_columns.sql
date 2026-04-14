-- Hub products cleanup: drop columns no longer used by office/web flows

-- Drop sort index that depends on sort_order (if it exists)
drop index if exists public.idx_hub_products_sort;

-- Drop constraints tied to removed columns
alter table public.hub_products
  drop constraint if exists hub_products_billing_context_check;

-- Remove no-longer-used columns (idempotent)
alter table public.hub_products
  drop column if exists long_description,
  drop column if exists billing_context,
  drop column if exists internal_notes,
  drop column if exists form_schema,
  drop column if exists sort_order;

-- Keep image support for Hub cards/details
alter table public.hub_products
  add column if not exists image_url text;

-- Keep useful list/search indexes
create index if not exists idx_hub_products_status on public.hub_products using btree (status);
create index if not exists idx_hub_products_category on public.hub_products using btree (category);

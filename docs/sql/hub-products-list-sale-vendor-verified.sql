-- Run in Supabase SQL editor (or your migration pipeline) before using list/sale price + vendor verified badge.

alter table hub_products
  add column if not exists list_price numeric,
  add column if not exists sale_price numeric;

update hub_products
set list_price = coalesce(list_price, fixed_amount)
where pricing_type = 'fixed'
  and fixed_amount is not null
  and list_price is null;

alter table hub_vendors
  add column if not exists is_verified boolean not null default false;

-- Marketplace line for Food/Mart (mirrors app `hubCategorySlug`); null when category is not food/mart.
create or replace function public.ciuna_hub_category_slug(cat text)
returns text
language sql
immutable
as $$
  select nullif(
    trim(both '-' from regexp_replace(
      replace(lower(trim(coalesce(cat, ''))), '''', ''),
      '[^a-z0-9]+',
      '-',
      'g'
    )),
    ''
  );
$$;

alter table hub_products
  add column if not exists service_line_slug text;

alter table hub_products
  drop constraint if exists hub_products_service_line_slug_check;

alter table hub_products
  add constraint hub_products_service_line_slug_check
  check (service_line_slug is null or service_line_slug in ('food', 'mart'));

update hub_products
set service_line_slug = 'mart';

-- To move specific products to Food later:
-- update hub_products set service_line_slug = 'food' where id in ('…');

alter table public.hub_products
add column if not exists fulfillment_type text;

update public.hub_products
set fulfillment_type = 'online'
where fulfillment_type is null;

alter table public.hub_products
alter column fulfillment_type set default 'online';

alter table public.hub_products
alter column fulfillment_type set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'hub_products_fulfillment_type_check'
  ) then
    alter table public.hub_products
    add constraint hub_products_fulfillment_type_check
    check (fulfillment_type in ('online', 'in_person'));
  end if;
end $$;

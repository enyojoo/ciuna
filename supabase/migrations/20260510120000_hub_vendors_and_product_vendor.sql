-- Hub marketplace: vendors (Food/Mart) + optional product.vendor_id

create table if not exists public.hub_vendors (
  id uuid primary key default gen_random_uuid(),
  service_line_slug text not null,
  name text not null,
  slug text not null,
  photo_url text,
  short_bio text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hub_vendors_service_line_slug_check
    check (service_line_slug in ('food', 'mart')),
  constraint hub_vendors_slug_format_check
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and length(slug) between 1 and 120)
);

create unique index if not exists hub_vendors_line_slug_uidx
  on public.hub_vendors (service_line_slug, slug);

create index if not exists hub_vendors_line_published_idx
  on public.hub_vendors (service_line_slug, is_published)
  where is_published = true;

create or replace function public.set_hub_vendors_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists hub_vendors_set_updated_at on public.hub_vendors;
create trigger hub_vendors_set_updated_at
  before update on public.hub_vendors
  for each row execute function public.set_hub_vendors_updated_at();

alter table public.hub_products
  add column if not exists vendor_id uuid references public.hub_vendors (id) on delete set null;

create index if not exists hub_products_vendor_id_idx
  on public.hub_products (vendor_id)
  where vendor_id is not null;

-- RLS (optional direct client reads; API uses service role which bypasses RLS)
alter table public.hub_vendors enable row level security;

drop policy if exists "hub_vendors_select_published_authenticated" on public.hub_vendors;
create policy "hub_vendors_select_published_authenticated"
  on public.hub_vendors
  for select
  to authenticated
  using (is_published = true);
-- Inserts/updates/deletes go through server routes with service role (bypasses RLS).

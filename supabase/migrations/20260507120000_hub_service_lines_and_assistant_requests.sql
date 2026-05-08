-- Hub super-app: configurable service lines + Assistant errand requests

create table if not exists public.hub_service_lines (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  short_description text,
  sort_order int not null default 0,
  is_enabled boolean not null default true,
  icon_url text,
  icon_key text,
  grid_kind text not null default 'hub_category'
    constraint hub_service_lines_grid_kind_check
    check (grid_kind in ('hub_category', 'app_link', 'external_url')),
  route_path text,
  href text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hub_service_lines_sort_idx
  on public.hub_service_lines (is_enabled, sort_order, slug);

create or replace function public.set_hub_service_lines_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists hub_service_lines_set_updated_at on public.hub_service_lines;
create trigger hub_service_lines_set_updated_at
  before update on public.hub_service_lines
  for each row execute function public.set_hub_service_lines_updated_at();

insert into public.hub_service_lines (slug, title, short_description, sort_order, is_enabled, grid_kind, route_path, href)
values
  ('food', 'Food', 'Have all your cravings delivered to your doorstep.', 10, true, 'hub_category', '/hub/food', null),
  ('mart', 'Mart', 'Find everything you need - groceries and more.', 20, true, 'hub_category', '/hub/mart', null),
  ('assistant', 'Assistant', 'Send packages, documents, and beyond.', 30, true, 'app_link', '/assistant', null),
  ('send', 'Send Money', 'Cross-border money transfer.', 40, true, 'app_link', '/send', null),
  ('experts', 'Experts', 'Trusted professionals for all your home and beauty needs.', 50, true, 'hub_category', '/hub/experts', null),
  ('insurance', 'Insurance', 'Get everyday protection with accessible insurance.', 60, true, 'hub_category', '/hub/insurance', null),
  ('experiences', 'Experiences', 'Find your next adventure, tours and events in Russia.', 70, true, 'hub_category', '/hub/experiences', null),
  ('gift-packs', 'Gift Packs', 'Send a fun yet practical gift card to someone today.', 80, true, 'hub_category', '/hub/gift-packs', null)
on conflict (slug) do nothing;

-- Assistant errand / courier requests (customer app + Office queue)

create table if not exists public.assistant_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  request_type text not null,
  status text not null default 'draft'
    constraint assistant_requests_status_check
    check (status in ('draft', 'submitted', 'quoted', 'paid', 'in_progress', 'completed', 'cancelled')),
  payload jsonb not null default '{}'::jsonb,
  quote_amount numeric,
  quote_currency text,
  transaction_id uuid references public.transactions (id) on delete set null,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists assistant_requests_user_idx on public.assistant_requests (user_id, created_at desc);
create index if not exists assistant_requests_status_idx on public.assistant_requests (status, created_at desc);

create or replace function public.set_assistant_requests_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists assistant_requests_set_updated_at on public.assistant_requests;
create trigger assistant_requests_set_updated_at
  before update on public.assistant_requests
  for each row execute function public.set_assistant_requests_updated_at();

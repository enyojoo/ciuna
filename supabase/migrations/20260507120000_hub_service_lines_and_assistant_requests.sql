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
  ('send', 'Send Money', 'Send money home and across borders.', 10, true, 'app_link', '/send', null),
  ('assistant', 'Assistant', 'Send packages, documents, and beyond.', 20, true, 'app_link', '/assistant', null),
  ('experts', 'Experts', 'Book professional services.', 30, true, 'hub_category', '/hub/experts', null),
  ('connectivity', 'Connectivity', 'SIMs, data, and connectivity.', 100, true, 'hub_category', '/hub/connectivity', null),
  ('card-payment', 'Card Payment', 'Card and payment products.', 110, true, 'hub_category', '/hub/card-payment', null),
  ('ai-tools', 'AI Tools', 'AI tools and subscriptions.', 120, true, 'hub_category', '/hub/ai-tools', null),
  ('entertainment', 'Entertainment', 'Streaming and entertainment.', 130, true, 'hub_category', '/hub/entertainment', null),
  ('other', 'Other', 'More marketplace offers.', 900, true, 'hub_category', '/hub/other', null)
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

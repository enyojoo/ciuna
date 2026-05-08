-- Replace placeholder hub_service_lines seed with product IA (Food, Mart, Assistant, …).
-- Safe on DBs that already ran 20260507120000_* (uses upsert + legacy slug cleanup).

insert into public.hub_service_lines (slug, title, short_description, sort_order, is_enabled, grid_kind, route_path, href)
values
  ('food', 'Food', 'Have all your cravings delivered to your doorstep.', 10, true, 'hub_category', '/hub/food', null),
  ('mart', 'Mart', 'Find everything you need - groceries and more.', 20, true, 'hub_category', '/hub/mart', null),
  (
    'assistant',
    'Assistant',
    'Send packages, documents, and beyond.',
    30,
    true,
    'app_link',
    '/assistant',
    null
  ),
  (
    'send',
    'Send Money',
    'Cross-border money transfer.',
    40,
    true,
    'app_link',
    '/send',
    null
  ),
  (
    'experts',
    'Experts',
    'Trusted professionals for all your home and beauty needs.',
    50,
    true,
    'hub_category',
    '/hub/experts',
    null
  ),
  (
    'insurance',
    'Insurance',
    'Get everyday protection with accessible insurance.',
    60,
    true,
    'hub_category',
    '/hub/insurance',
    null
  ),
  (
    'experiences',
    'Experiences',
    'Find your next adventure, tours and events in Russia.',
    70,
    true,
    'hub_category',
    '/hub/experiences',
    null
  ),
  (
    'gift-packs',
    'Gift Packs',
    'Send a fun yet practical gift card to someone today.',
    80,
    true,
    'hub_category',
    '/hub/gift-packs',
    null
  )
on conflict (slug) do update set
  title = excluded.title,
  short_description = excluded.short_description,
  sort_order = excluded.sort_order,
  is_enabled = excluded.is_enabled,
  grid_kind = excluded.grid_kind,
  route_path = excluded.route_path,
  href = excluded.href,
  updated_at = now();

-- Remove early placeholder catalog lines (not part of super-app IA).
delete from public.hub_service_lines
where slug in ('connectivity', 'card-payment', 'ai-tools', 'entertainment', 'other');

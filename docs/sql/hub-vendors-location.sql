-- Vendor storefront location (set from Office → Food/Mart → Vendors).
-- Run in Supabase SQL editor (or your migration pipeline).

alter table hub_vendors
  add column if not exists location text;

comment on column hub_vendors.location is 'Display location for the hub vendor storefront (free text; suggested values in Office UI).';

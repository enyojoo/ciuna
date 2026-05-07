-- Phase B (MVP tables): expert directory + simple booking requests

create table if not exists public.expert_profiles (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  headline text,
  bio text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.expert_bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  expert_profile_id uuid not null references public.expert_profiles (id) on delete cascade,
  status text not null default 'pending'
    constraint expert_bookings_status_check
    check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  slot_start timestamptz,
  slot_end timestamptz,
  message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists expert_bookings_user_idx on public.expert_bookings (user_id, created_at desc);

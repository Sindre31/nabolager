-- Nabolager — initial schema
-- Marketplace for neighbourhood storage (boder, garasjer, loft, container …).
-- Demo-grade RLS: open to the anon role so the prototype runs without auth.

-- ─────────────────────────────────────────────────────────────
-- profiles  (demo users / hosts)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  initials     text,
  city         text,
  member_since text,
  rating       numeric(2,1),
  tenancies    int  not null default 0,
  as_host      int  not null default 0,
  created_at   timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- listings  (storage spaces — host info embedded to mirror the design)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.listings (
  id            text primary key,
  num           text not null,
  title         text not null,
  type          text not null,            -- Bod | Garasje | Loft | Container | Industri
  city          text not null,
  area          text not null,
  distance      text,
  size_m2       int,
  size_m3       int,
  price         int,                       -- kr / month
  rating        numeric(2,1),
  reviews       int,
  ph            text,                       -- lead photo caption
  avail         text,                       -- "Ledig fra 15. mai" …
  features      text[] not null default '{}',
  description   text,
  access        text,
  rules         text[] not null default '{}',
  coords        jsonb,                      -- { "x": 30, "y": 40 } map position
  host_name     text,
  host_initials text,
  host_since    text,
  host_verified boolean not null default true,
  host_rating   numeric(2,1),
  host_reviews  int,
  owner_id      uuid references public.profiles(id) on delete set null,
  status        text not null default 'active',  -- active | rented
  views         int  not null default 0,
  created_at    timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- requests  (booking / send-forespørsel)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.requests (
  id          uuid primary key default gen_random_uuid(),
  req_id      text unique,                 -- NL-2026-0xxxx
  listing_id  text references public.listings(id) on delete cascade,
  from_name   text,
  from_phone  text,
  message     text,
  period_from text,
  period_to   text,
  time_label  text,                        -- relative label for seeded rows ("I dag 14:22")
  status      text not null default 'pending',  -- pending | accepted | declined
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- favorites  (a profile's saved listings)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.favorites (
  profile_id uuid references public.profiles(id) on delete cascade,
  listing_id text references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, listing_id)
);

create index if not exists listings_type_idx     on public.listings (type);
create index if not exists listings_owner_idx     on public.listings (owner_id);
create index if not exists requests_listing_idx   on public.requests (listing_id);
create index if not exists requests_status_idx     on public.requests (status);

-- ─────────────────────────────────────────────────────────────
-- Row Level Security — demo policies (open to anon).
-- Tighten these before any real launch (scope by auth.uid()).
-- ─────────────────────────────────────────────────────────────
alter table public.profiles  enable row level security;
alter table public.listings  enable row level security;
alter table public.requests  enable row level security;
alter table public.favorites enable row level security;

drop policy if exists demo_all_profiles  on public.profiles;
drop policy if exists demo_all_listings  on public.listings;
drop policy if exists demo_all_requests  on public.requests;
drop policy if exists demo_all_favorites on public.favorites;

create policy demo_all_profiles  on public.profiles  for all using (true) with check (true);
create policy demo_all_listings  on public.listings  for all using (true) with check (true);
create policy demo_all_requests  on public.requests  for all using (true) with check (true);
create policy demo_all_favorites on public.favorites for all using (true) with check (true);

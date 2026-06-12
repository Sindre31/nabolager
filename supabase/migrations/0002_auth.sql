-- Nabolager — auth: magic-link sign-in, per-user data, tightened RLS.
-- Run after 0001_init.sql and seed.sql.

-- ─────────────────────────────────────────────────────────────
-- Auto-create a profile row whenever a new auth user signs up.
-- SECURITY DEFINER so it runs regardless of RLS.
-- ─────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, initials, city, member_since, rating, tenancies, as_host)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'name', ''), split_part(new.email, '@', 1)),
    upper(left(coalesce(nullif(new.raw_user_meta_data->>'name', ''), new.email), 1)),
    'Oslo',
    to_char(now(), 'YYYY'),
    5.0, 0, 0
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Track who sent a booking request (so renters can see their own requests).
alter table public.requests
  add column if not exists requester_id uuid references public.profiles(id) on delete set null;

-- ─────────────────────────────────────────────────────────────
-- Replace the open demo policies with per-user policies.
-- ─────────────────────────────────────────────────────────────

-- profiles: world-readable (host names shown on listings); you edit only yours.
drop policy if exists demo_all_profiles on public.profiles;
drop policy if exists profiles_select on public.profiles;
drop policy if exists profiles_insert on public.profiles;
drop policy if exists profiles_update on public.profiles;
create policy profiles_select on public.profiles for select using (true);
create policy profiles_insert on public.profiles for insert with check (id = auth.uid());
create policy profiles_update on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- listings: anyone can browse; only the owner can create/edit.
drop policy if exists demo_all_listings on public.listings;
drop policy if exists listings_select on public.listings;
drop policy if exists listings_insert on public.listings;
drop policy if exists listings_update on public.listings;
create policy listings_select on public.listings for select using (true);
create policy listings_insert on public.listings for insert with check (owner_id = auth.uid());
create policy listings_update on public.listings for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- favorites: strictly your own.
drop policy if exists demo_all_favorites on public.favorites;
drop policy if exists favorites_rw on public.favorites;
create policy favorites_rw on public.favorites for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- requests: a signed-in renter creates them; the renter and the listing's
-- host can read them; only the host can accept/decline.
drop policy if exists demo_all_requests on public.requests;
drop policy if exists requests_insert on public.requests;
drop policy if exists requests_select on public.requests;
drop policy if exists requests_update on public.requests;
create policy requests_insert on public.requests for insert to authenticated
  with check (requester_id = auth.uid());
create policy requests_select on public.requests for select using (
  requester_id = auth.uid()
  or auth.uid() = (select owner_id from public.listings where listings.id = requests.listing_id)
);
create policy requests_update on public.requests for update using (
  auth.uid() = (select owner_id from public.listings where listings.id = requests.listing_id)
) with check (true);

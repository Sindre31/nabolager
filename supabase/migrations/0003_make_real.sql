-- Nabolager — strip the demo user and demo-only data from an already-seeded DB.
-- Run once on databases that were populated with the original seed.sql.
-- (Fresh installs using the updated seed.sql don't need this.)

-- Remove seeded host-inbox requests (they have no real requester).
delete from public.requests where requester_id is null;

-- Detach the seeded listings from the demo profile (keep them as inventory).
update public.listings
  set owner_id = null
  where owner_id = '00000000-0000-0000-0000-000000000001';

-- Drop the demo profile and its favourites.
delete from public.favorites where profile_id = '00000000-0000-0000-0000-000000000001';
delete from public.profiles  where id         = '00000000-0000-0000-0000-000000000001';

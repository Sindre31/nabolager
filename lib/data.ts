import { createSupabaseServerClient } from '@/lib/supabase/server';
import { DEMO_PROFILE_ID } from '@/lib/constants';
import type { AppData, Listing, Profile, RequestRow } from '@/lib/types';

/**
 * Loads everything the phone app needs in one server round-trip.
 * Runs as the demo user (no auth in this pilot).
 */
export async function loadAppData(): Promise<AppData> {
  const supabase = await createSupabaseServerClient();

  const [listingsRes, profileRes, favRes, reqRes] = await Promise.all([
    supabase.from('listings').select('*').order('num', { ascending: true }),
    supabase.from('profiles').select('*').eq('id', DEMO_PROFILE_ID).single(),
    supabase.from('favorites').select('listing_id').eq('profile_id', DEMO_PROFILE_ID),
    supabase.from('requests').select('*').order('created_at', { ascending: false }),
  ]);

  if (listingsRes.error) throw listingsRes.error;

  const listings = (listingsRes.data ?? []) as Listing[];
  const profile = (profileRes.data ?? {
    id: DEMO_PROFILE_ID,
    name: 'Ola Nordmann',
    initials: 'O',
    city: 'Oslo',
    member_since: '2026',
    rating: 4.9,
    tenancies: 2,
    as_host: 2,
  }) as Profile;
  const favoriteIds = (favRes.data ?? []).map((f) => f.listing_id as string);
  const requests = (reqRes.data ?? []) as RequestRow[];

  return { listings, profile, favoriteIds, requests };
}

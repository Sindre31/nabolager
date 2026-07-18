import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { AppData, Listing, Profile, RequestRow } from '@/lib/types';

/**
 * Loads everything the phone app needs. With no authenticated session, the
 * app is still browsable — `listings` is world-readable by RLS — so we
 * return a read-only guest view of the same shape (empty favourites/requests,
 * a placeholder profile) instead of blocking the whole site behind login.
 */
export async function loadAppData(): Promise<AppData> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const { data, error } = await supabase.from('listings').select('*').order('num', { ascending: true });
    if (error) throw error;
    return {
      listings: (data ?? []) as Listing[],
      profile: {
        id: '',
        name: 'Gjest',
        initials: 'G',
        city: 'Oslo',
        member_since: String(new Date().getFullYear()),
        rating: 5.0,
        tenancies: 0,
        as_host: 0,
      },
      favoriteIds: [],
      requests: [],
      userEmail: null,
      isGuest: true,
    };
  }

  const [listingsRes, profileRes, favRes, reqRes] = await Promise.all([
    supabase.from('listings').select('*').order('num', { ascending: true }),
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('favorites').select('listing_id').eq('profile_id', user.id),
    // RLS returns the rows this user is allowed to see: requests they sent,
    // plus requests for listings they host.
    supabase.from('requests').select('*').order('created_at', { ascending: false }),
  ]);

  if (listingsRes.error) throw listingsRes.error;

  const listings = (listingsRes.data ?? []) as Listing[];

  // The signup trigger creates the profile; fall back to user metadata if it
  // hasn't propagated yet on the very first load.
  const meta = (user.user_metadata ?? {}) as { name?: string };
  const fallbackName = meta.name || user.email?.split('@')[0] || 'Nabo';
  const profile = (profileRes.data ?? {
    id: user.id,
    name: fallbackName,
    initials: fallbackName.slice(0, 1).toUpperCase(),
    city: 'Oslo',
    member_since: String(new Date().getFullYear()),
    rating: 5.0,
    tenancies: 0,
    as_host: 0,
  }) as Profile;

  const favoriteIds = (favRes.data ?? []).map((f) => f.listing_id as string);
  const requests = (reqRes.data ?? []) as RequestRow[];

  return { listings, profile, favoriteIds, requests, userEmail: user.email ?? null, isGuest: false };
}

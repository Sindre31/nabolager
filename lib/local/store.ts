// No-Supabase demo mode: same data shapes and mutation signatures as
// app/actions.ts, but everything reads/writes localStorage instead of
// Postgres. Single-browser, single-profile — there's no second party to
// simulate the "host receives a request" side of the marketplace, so
// incoming requests on your own listings will stay empty. That's an
// accepted limitation of a local-only demo.
import type { AppData, CreateRequestInput, Listing, Profile, PublishInput, RequestRow } from '@/lib/types';
import { SEED_LISTINGS } from './seed-listings';

const KEY = 'nabolager_local_v1';

interface LocalState {
  profile: Profile | null;
  listings: Listing[];
  favoriteIds: string[];
  requests: RequestRow[];
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

function read(): LocalState {
  if (typeof window === 'undefined') {
    return { profile: null, listings: SEED_LISTINGS, favoriteIds: [], requests: [] };
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as LocalState;
  } catch {
    /* fall through to fresh state */
  }
  const fresh: LocalState = { profile: null, listings: SEED_LISTINGS, favoriteIds: [], requests: [] };
  write(fresh);
  return fresh;
}

function write(state: LocalState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable (private browsing, quota) — demo just won't persist */
  }
}

export function loadLocalAppData(): AppData | null {
  const s = read();
  if (!s.profile) return null;
  return { listings: s.listings, profile: s.profile, favoriteIds: s.favoriteIds, requests: s.requests, userEmail: null };
}

export function localSignIn(name: string): AppData {
  const s = read();
  const trimmed = name.trim() || 'Nabo';
  const initials = trimmed
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
  s.profile = {
    id: 'local-' + Math.abs(hashString(trimmed + Date.now())).toString(36),
    name: trimmed,
    initials: initials || 'N',
    city: 'Oslo',
    member_since: String(new Date().getFullYear()),
    rating: 5.0,
    tenancies: 0,
    as_host: 0,
  };
  write(s);
  return { listings: s.listings, profile: s.profile, favoriteIds: s.favoriteIds, requests: s.requests, userEmail: null };
}

export function localSignOut(): void {
  write({ profile: null, listings: SEED_LISTINGS, favoriteIds: [], requests: [] });
}

export async function localToggleFavorite(listingId: string, makeFavorite: boolean): Promise<void> {
  const s = read();
  s.favoriteIds = makeFavorite
    ? [...new Set([...s.favoriteIds, listingId])]
    : s.favoriteIds.filter((id) => id !== listingId);
  write(s);
}

export async function localCreateRequest(input: CreateRequestInput): Promise<{ reqId: string }> {
  const s = read();
  const reqId = 'NL-2026-0' + (4800 + (parseInt(input.listingNum, 10) || 0));
  const row: RequestRow = {
    id: 'r-' + Date.now().toString(36),
    req_id: reqId,
    listing_id: input.listingId,
    requester_id: s.profile?.id ?? null,
    from_name: input.fromName,
    from_phone: input.fromPhone || null,
    message: input.message,
    period_from: input.periodFrom ?? '15. mai 2026',
    period_to: input.periodTo ?? '15. aug 2026',
    time_label: null,
    status: 'pending',
    created_at: new Date().toISOString(),
  };
  s.requests = [...s.requests, row];
  write(s);
  return { reqId };
}

export async function localSetRequestStatus(requestId: string, status: 'accepted' | 'declined'): Promise<void> {
  const s = read();
  s.requests = s.requests.map((r) => (r.id === requestId ? { ...r, status } : r));
  write(s);
}

export async function localPublishListing(input: PublishInput): Promise<{ id: string }> {
  const s = read();
  const num = String(s.listings.length + 1).padStart(2, '0');
  const id = 'l-' + num + '-' + Math.abs(hashString(input.area + input.type + (s.profile?.id ?? ''))).toString(36);
  const hostName = s.profile?.name || 'Nabo';
  const listing: Listing = {
    id,
    num,
    title: `${input.type} i ${input.area}`,
    type: input.type,
    city: 'Oslo',
    area: input.area,
    distance: null,
    size_m2: input.sizeM2,
    size_m3: Math.round(input.sizeM2 * 2.4),
    price: input.price,
    rating: 5.0,
    reviews: 0,
    ph: `${input.type.toLowerCase()} · ${input.sizeM2} m²`,
    avail: 'Ledig nå',
    features: [],
    description: null,
    access: null,
    rules: [],
    coords: { x: 50, y: 50 },
    host_name: hostName,
    host_initials: hostName.slice(0, 1).toUpperCase(),
    host_since: String(new Date().getFullYear()),
    host_verified: false,
    host_rating: 5.0,
    host_reviews: 0,
    owner_id: s.profile?.id ?? null,
    status: 'active',
    views: 0,
  };
  s.listings = [...s.listings, listing];
  write(s);
  return { id };
}

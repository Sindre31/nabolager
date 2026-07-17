// Domain types — shared between server fetch, actions and client screens.

export type ListingType = 'Bod' | 'Garasje' | 'Loft' | 'Container' | 'Industri';

export interface Listing {
  id: string;
  num: string;
  title: string;
  type: ListingType | string;
  city: string;
  area: string;
  distance: string | null;
  size_m2: number;
  size_m3: number;
  price: number;
  rating: number;
  reviews: number;
  ph: string;
  avail: string;
  features: string[];
  description: string | null;
  access: string | null;
  rules: string[];
  coords: { x: number; y: number } | null;
  host_name: string;
  host_initials: string;
  host_since: string;
  host_verified: boolean;
  host_rating: number;
  host_reviews: number;
  owner_id: string | null;
  status: 'active' | 'rented' | string;
  views: number;
}

export interface RequestRow {
  id: string;
  req_id: string | null;
  listing_id: string;
  requester_id: string | null;
  from_name: string;
  from_phone: string | null;
  message: string;
  period_from: string | null;
  period_to: string | null;
  time_label: string | null;
  status: 'pending' | 'accepted' | 'declined' | string;
  created_at: string;
}

export interface Profile {
  id: string;
  name: string;
  initials: string;
  city: string;
  member_since: string;
  rating: number;
  tenancies: number;
  as_host: number;
}

/** Everything the phone app needs for an initial render. */
export interface AppData {
  listings: Listing[];
  profile: Profile;
  favoriteIds: string[];
  requests: RequestRow[];
  userEmail: string | null;
}

export interface CreateRequestInput {
  listingId: string;
  listingNum: string;
  fromName: string;
  fromPhone: string;
  message: string;
  periodFrom?: string;
  periodTo?: string;
}

export interface PublishInput {
  type: string;
  sizeM2: number;
  area: string;
  price: number;
}

/**
 * The 5 mutations PhoneApp needs, injected as props so the same UI works
 * against either the real Supabase server actions (app/actions.ts) or the
 * no-Supabase local/localStorage implementation (lib/local/store.ts).
 */
export interface PhoneAppActions {
  toggleFavorite: (listingId: string, makeFavorite: boolean) => Promise<void>;
  createRequest: (input: CreateRequestInput) => Promise<{ reqId: string }>;
  setRequestStatus: (requestId: string, status: 'accepted' | 'declined') => Promise<void>;
  publishListing: (input: PublishInput) => Promise<{ id: string }>;
  signOut: () => Promise<void>;
}

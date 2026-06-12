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
}

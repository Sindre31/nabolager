'use client';

// In-memory replacement for the database + server actions.
//
// Every mutation the app used to persist (favourites, requests, publishing,
// sign in/out) happens here in React state instead. Changes are real for the
// length of the visit and reset on reload — which is exactly what a demo
// wants: no backend, no credentials, nothing to set up.

import { useCallback, useMemo, useState } from 'react';
import {
  DEMO_EMAIL,
  DEMO_FAVORITE_IDS,
  DEMO_LISTINGS,
  DEMO_PROFILE,
  DEMO_REQUESTS,
  DEMO_USER_ID,
  GUEST_PROFILE,
} from '@/lib/demo-data';
import { initialsOf } from '@/lib/format';
import type { AppData, Listing, RequestRow } from '@/lib/types';

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

export interface DemoStore extends AppData {
  /** Signed in, and the demo starts that way, so no screen is empty. */
  toggleFavorite: (listingId: string) => void;
  createRequest: (input: CreateRequestInput) => string;
  setRequestStatus: (requestId: string, status: 'accepted' | 'declined') => void;
  publishListing: (input: PublishInput) => void;
  signIn: (name: string, email: string) => void;
  signOut: () => void;
  /** Back to the seeded state, without a page reload. */
  reset: () => void;
}

interface Session {
  signedIn: boolean;
  name: string;
  email: string;
}

const INITIAL_SESSION: Session = { signedIn: true, name: DEMO_PROFILE.name, email: DEMO_EMAIL };

/** № of the next published listing — one past the highest in the set. */
function nextNum(listings: Listing[]): string {
  const max = listings.reduce((m, l) => Math.max(m, parseInt(l.num, 10) || 0), 0);
  return String(max + 1).padStart(2, '0');
}

export function useDemoStore(): DemoStore {
  const [listings, setListings] = useState<Listing[]>(DEMO_LISTINGS);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(DEMO_FAVORITE_IDS);
  const [requests, setRequests] = useState<RequestRow[]>(DEMO_REQUESTS);
  const [session, setSession] = useState<Session>(INITIAL_SESSION);

  const profile = useMemo(
    () =>
      session.signedIn
        ? { ...DEMO_PROFILE, name: session.name, initials: initialsOf(session.name) || 'N' }
        : GUEST_PROFILE,
    [session],
  );

  const toggleFavorite = useCallback((listingId: string) => {
    setFavoriteIds((ids) =>
      ids.includes(listingId) ? ids.filter((id) => id !== listingId) : [...ids, listingId],
    );
  }, []);

  const createRequest = useCallback(
    (input: CreateRequestInput) => {
      const reqId = 'NL-2026-0' + (4800 + (parseInt(input.listingNum, 10) || 0));
      setRequests((rs) => [
        {
          // `rs.length` only grows, so ids stay unique even if the same
          // listing is asked about twice.
          id: `req-${reqId}-${rs.length}`,
          req_id: reqId,
          listing_id: input.listingId,
          requester_id: DEMO_USER_ID,
          from_name: input.fromName,
          from_phone: input.fromPhone || null,
          message: input.message,
          period_from: input.periodFrom ?? '15. mai 2026',
          period_to: input.periodTo ?? '15. aug 2026',
          time_label: 'Nettopp',
          status: 'pending',
          created_at: new Date().toISOString(),
        },
        ...rs,
      ]);
      return reqId;
    },
    [],
  );

  const setRequestStatus = useCallback((requestId: string, status: 'accepted' | 'declined') => {
    setRequests((rs) => rs.map((r) => (r.id === requestId ? { ...r, status } : r)));
  }, []);

  const publishListing = useCallback(
    (input: PublishInput) => {
      const hostName = session.signedIn ? session.name : DEMO_PROFILE.name;
      setListings((ls) => {
        const num = nextNum(ls);
        const listing: Listing = {
          id: `l-${num}-${ls.length}`,
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
          host_initials: initialsOf(hostName) || 'N',
          host_since: '2026',
          host_verified: false,
          host_rating: 5.0,
          host_reviews: 0,
          owner_id: DEMO_USER_ID,
          status: 'active',
          views: 0,
        };
        return [...ls, listing];
      });
    },
    [session],
  );

  const signIn = useCallback((name: string, email: string) => {
    setSession({
      signedIn: true,
      name: name.trim() || DEMO_PROFILE.name,
      email: email.trim() || DEMO_EMAIL,
    });
  }, []);

  const signOut = useCallback(() => {
    setSession({ signedIn: false, name: GUEST_PROFILE.name, email: '' });
  }, []);

  const reset = useCallback(() => {
    setListings(DEMO_LISTINGS);
    setFavoriteIds(DEMO_FAVORITE_IDS);
    setRequests(DEMO_REQUESTS);
    setSession(INITIAL_SESSION);
  }, []);

  return {
    listings,
    profile,
    // A guest sees the public inventory only — no saved hearts, no history.
    favoriteIds: session.signedIn ? favoriteIds : [],
    requests: session.signedIn ? requests : [],
    userEmail: session.signedIn ? session.email : null,
    isGuest: !session.signedIn,
    toggleFavorite,
    createRequest,
    setRequestStatus,
    publishListing,
    signIn,
    signOut,
    reset,
  };
}

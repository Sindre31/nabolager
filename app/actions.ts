'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { DEMO_PROFILE_ID } from '@/lib/constants';

// ── Favourites ──────────────────────────────────────────────────────────────
export async function toggleFavorite(listingId: string, makeFavorite: boolean) {
  const supabase = await createSupabaseServerClient();
  if (makeFavorite) {
    await supabase
      .from('favorites')
      .upsert({ profile_id: DEMO_PROFILE_ID, listing_id: listingId });
  } else {
    await supabase
      .from('favorites')
      .delete()
      .eq('profile_id', DEMO_PROFILE_ID)
      .eq('listing_id', listingId);
  }
  revalidatePath('/');
}

// ── Booking request (send forespørsel) ──────────────────────────────────────
export interface CreateRequestInput {
  listingId: string;
  listingNum: string;
  fromName: string;
  fromPhone: string;
  message: string;
  periodFrom?: string;
  periodTo?: string;
}

export async function createRequest(input: CreateRequestInput): Promise<{ reqId: string }> {
  const supabase = await createSupabaseServerClient();
  const reqId = 'NL-2026-0' + (4800 + (parseInt(input.listingNum, 10) || 0));

  await supabase.from('requests').insert({
    req_id: reqId,
    listing_id: input.listingId,
    from_name: input.fromName,
    from_phone: input.fromPhone || null,
    message: input.message,
    period_from: input.periodFrom ?? '15. mai 2026',
    period_to: input.periodTo ?? '15. aug 2026',
    status: 'pending',
  });

  revalidatePath('/');
  return { reqId };
}

// ── Host inbox: accept / decline ────────────────────────────────────────────
export async function setRequestStatus(
  requestId: string,
  status: 'accepted' | 'declined',
) {
  const supabase = await createSupabaseServerClient();
  await supabase.from('requests').update({ status }).eq('id', requestId);
  revalidatePath('/');
}

// ── Publish a new listing (Bli vert) ────────────────────────────────────────
export interface PublishInput {
  type: string;
  sizeM2: number;
  area: string;
  price: number;
}

export async function publishListing(input: PublishInput): Promise<{ id: string }> {
  const supabase = await createSupabaseServerClient();

  const { count } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true });
  const num = String((count ?? 0) + 1).padStart(2, '0');
  const id = 'l-' + num + '-' + Math.abs(hashString(input.area + input.type)).toString(36);

  await supabase.from('listings').insert({
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
    host_name: 'Ola Nordmann',
    host_initials: 'O',
    host_since: '2026',
    host_verified: true,
    host_rating: 4.9,
    host_reviews: 0,
    owner_id: DEMO_PROFILE_ID,
    status: 'active',
    views: 0,
  });

  revalidatePath('/');
  return { id };
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

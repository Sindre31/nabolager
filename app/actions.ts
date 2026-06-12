'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';

async function requireUser(): Promise<{ supabase: SupabaseClient; user: User }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return { supabase, user };
}

// ── Favourites ──────────────────────────────────────────────────────────────
export async function toggleFavorite(listingId: string, makeFavorite: boolean) {
  const { supabase, user } = await requireUser();
  if (makeFavorite) {
    await supabase.from('favorites').upsert({ profile_id: user.id, listing_id: listingId });
  } else {
    await supabase
      .from('favorites')
      .delete()
      .eq('profile_id', user.id)
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
  const { supabase, user } = await requireUser();
  const reqId = 'NL-2026-0' + (4800 + (parseInt(input.listingNum, 10) || 0));

  await supabase.from('requests').insert({
    req_id: reqId,
    listing_id: input.listingId,
    requester_id: user.id,
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

// ── Host inbox: accept / decline (RLS lets only the listing owner update) ────
export async function setRequestStatus(requestId: string, status: 'accepted' | 'declined') {
  const { supabase } = await requireUser();
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
  const { supabase, user } = await requireUser();

  const { count } = await supabase.from('listings').select('*', { count: 'exact', head: true });
  const num = String((count ?? 0) + 1).padStart(2, '0');
  const id = 'l-' + num + '-' + Math.abs(hashString(input.area + input.type + user.id)).toString(36);

  const meta = (user.user_metadata ?? {}) as { name?: string };
  const hostName = meta.name || user.email?.split('@')[0] || 'Nabo';

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
    host_name: hostName,
    host_initials: hostName.slice(0, 1).toUpperCase(),
    host_since: String(new Date().getFullYear()),
    host_verified: false,
    host_rating: 5.0,
    host_reviews: 0,
    owner_id: user.id,
    status: 'active',
    views: 0,
  });

  revalidatePath('/');
  return { id };
}

// ── Sign out ────────────────────────────────────────────────────────────────
export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath('/');
  redirect('/');
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

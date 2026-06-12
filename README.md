# Nabolager

A neighbourhood storage marketplace — rent a nabo's bod, garasje, loft or container,
or list your own. Built from the Claude Design prototype (`Nabolager.dc.html`) as a
**Next.js** app with **live Supabase** data, rendered inside an iOS device frame.

> Warm sand palette · Instrument Serif headlines · Geist UI · Geist Mono labels ·
> terracotta accent · muted-green "ledig" signal · formidler (broker) model.

## Screens

Home · Explore (list + sand map) · Listing detail · Booking (3-step + receipt) ·
Bli vert (income calculator + publish) · Mine annonser (KPIs, listings, request inbox) ·
Profil — with a bottom tab bar and pinned detail/booking action bars.

## Stack

- **Next.js 16** (App Router, React 19, TypeScript) — server components + server actions
- **Supabase** (`@supabase/supabase-js` + `@supabase/ssr`) — Postgres + RLS
- Pixel-for-pixel inline styles ported from the design (no CSS framework)

## Getting started

### 1. Install

```bash
npm install
```

### 2. Create a Supabase project

At [supabase.com](https://supabase.com), create a project. Then in **SQL Editor**, run, in order:

1. `supabase/migrations/0001_init.sql` — tables + indexes
2. `supabase/seed.sql` — launch inventory (the listings)
3. `supabase/migrations/0002_auth.sql` — signup trigger + per-user RLS

> Already ran the *old* seed (with the demo user)? Also run
> `supabase/migrations/0003_make_real.sql` once to strip the demo rows.

### Auth (magic link) — URL configuration

In **Authentication → URL Configuration**, set:

- **Site URL**: your deployed origin (e.g. `https://nabolager-five.vercel.app`)
- **Redirect URLs** (add both):
  - `https://<your-domain>/auth/callback`
  - `http://localhost:3000/auth/callback`

Email auth is on by default; magic links use Supabase's built-in mailer
(rate-limited on the free tier — add SMTP for volume).

### 3. Add credentials

```bash
cp .env.example .env.local
```

Fill in from **Project Settings → API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
```

### 4. Run

```bash
npm run dev
```

Open <http://localhost:3000>. Until the env vars are set (or if the tables are empty),
the app shows an in-frame setup notice with these same steps.

## What's actually live

Everything reads from and writes to Postgres:

| Action | Table | Server action |
| --- | --- | --- |
| Log in / register (magic link) | `auth.users` → `profiles` (trigger) | `signInWithOtp` (client) |
| Save / unsave a listing (heart) | `favorites` | `toggleFavorite` |
| Send a booking request | `requests` | `createRequest` → returns Forespørsel-ID |
| Accept / decline a request (host inbox) | `requests.status` | `setRequestStatus` |
| Publish a new listing (Bli vert) | `listings` | `publishListing` |
| Sign out | — | `signOut` |

Mutations are optimistic in the UI and persisted via server actions that
`revalidatePath('/')`, so a refresh reflects the database.

## Data model

`profiles` · `listings` (host info embedded to mirror the design) · `requests` · `favorites`.
See `lib/types.ts`.

## Notes / decisions

- **Auth required.** The app is gated behind magic-link login/registration; all
  per-user data (favourites, requests, owned listings, profile) is scoped to
  `auth.uid()` via RLS (`0002_auth.sql`). A signup trigger creates the `profiles`
  row. Returning-user **Face ID (WebAuthn passkeys)** is the planned next step.
- **Real, not demo.** Profile, dashboard KPIs, tenancies and popular areas all
  derive from the signed-in user and live data, with empty states. The seeded
  listings are real browsable launch inventory (`owner_id` null until claimed).
- **Date pickers** in booking are visual (fixed 15. mai – 15. aug), as in the prototype.
- **Photos** are the design's striped placeholders, ready for real images.
- The host income calculator and price ranges use the design's per-type rates
  (`HOST_RATES` in `lib/constants.ts`).

## Project layout

```
app/
  page.tsx          server: load data → render frame + app (or setup notice)
  actions.ts        server actions (favorites, requests, publish)
  layout.tsx        fonts + metadata
components/
  IOSDevice.tsx     iOS 26 device frame
  PhoneApp.tsx      all 7 screens + navigation + optimistic state
  SetupNotice.tsx   in-frame onboarding when Supabase isn't wired
lib/
  data.ts           single server round-trip loader
  supabase/server.ts
  types.ts  constants.ts  format.ts
supabase/
  migrations/0001_init.sql
  seed.sql
```

The original design bundle is stashed in `.design/` for reference.

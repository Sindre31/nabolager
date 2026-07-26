# Nabolager

A neighbourhood storage marketplace — rent a nabo's bod, garasje, loft or container,
or list your own. Built from the Claude Design prototype (`Nabolager.dc.html`) as a
**Next.js** app, rendered inside an iOS device frame.

This is a **demo build**: it runs entirely in the browser on a bundled dataset.
No database, no accounts, no environment variables — clone, `npm install`,
`npm run dev`, and every screen and flow works.

> Warm sand palette · Instrument Serif headlines · Geist UI · Geist Mono labels ·
> terracotta accent · muted-green "ledig" signal · formidler (broker) model.

## Screens

Home · Explore (list + sand map) · Listing detail · Booking (3-step + receipt) ·
Bli vert (income calculator + publish) · Mine annonser (KPIs, listings, request inbox) ·
Profil — with a bottom tab bar and pinned detail/booking action bars.

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. That's the whole setup.

## Stack

- **Next.js 16** (App Router, React 19, TypeScript) — the page is fully static
- **No backend** — the demo dataset and all mutations live in the client
- Pixel-for-pixel inline styles ported from the design (no CSS framework)

## What works in the demo

You start signed in as **Kari Nordmann**, who owns two listings and rents a third,
so no screen is empty. Everything below is interactive:

| Action | Effect |
| --- | --- |
| Save / unsave a listing (heart) | Toggles in `favoriteIds` |
| Send a booking request | Adds a request, returns a Forespørsel-ID, shows on the receipt and under Mine leieforhold |
| Accept / decline a request (host inbox) | Updates the request status and the pending badge |
| Publish a new listing (Bli vert) | Appends a listing, visible in Utforsk and Mine annonser |
| Log out | Switches to read-only guest browsing, with a login prompt on write actions |
| Log in | Instant — no e-mail is sent, the fields are pre-filled |
| Nullstill demodata (Profil) | Restores the seeded state |

Changes last for the visit and reset on reload, since nothing is persisted.

## Project layout

```
app/
  page.tsx          static page: device frame + app
  layout.tsx        fonts + metadata
components/
  IOSDevice.tsx     iOS 26 device frame
  PhoneApp.tsx      all 7 screens + navigation
  AuthScreen.tsx    demo sign-in (no e-mail, no provider)
lib/
  demo-data.ts      the seeded listings, profile, requests and favourites
  demo-store.ts     in-memory store — the mutations the app used to persist
  types.ts  constants.ts  format.ts
supabase/
  migrations/  seed.sql   reference SQL, unused by the demo (see below)
```

## Notes / decisions

- **No Supabase.** An earlier build read and wrote live Postgres via Supabase.
  The demo drops the client, the server actions, the auth callback route and the
  session middleware; screens read from `lib/demo-data.ts` and mutate through
  `lib/demo-store.ts`. The SQL under `supabase/` is kept as a schema reference
  for whoever wires a real backend back up — nothing in the app reads it.
- **Deterministic seed data.** No `Date.now()` or randomness in the dataset, so
  the server-rendered HTML and the client hydration match.
- **Date pickers** in booking are visual (fixed 15. mai – 15. aug), as in the prototype.
- **Photos** are the design's striped placeholders, ready for real images.
- The host income calculator and price ranges use the design's per-type rates
  (`HOST_RATES` in `lib/constants.ts`).

The original design bundle is stashed in `.design/` for reference.

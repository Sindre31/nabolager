'use client';

import { useEffect, useRef, useState } from 'react';
import { SERIF, SANS, MONO } from '@/components/fonts';
import { fmt } from '@/lib/format';
import { LISTING_TYPES, HOST_RATES } from '@/lib/constants';
import { useDemoStore } from '@/lib/demo-store';
import type { Listing, RequestRow } from '@/lib/types';
import AuthScreen from '@/components/AuthScreen';

type Screen = 'home' | 'explore' | 'detail' | 'booking' | 'host' | 'dash' | 'profile' | 'auth';
const TAB_SCREENS: Screen[] = ['home', 'explore', 'host', 'dash', 'profile'];

// palette
const SAND = '#F4EFE7';
const INK = '#211C16';
const CLAY = '#C2683F';
const BORDER = '#E7E0D4';
const MUTED = '#9A8F7E';
const BODY = '#4A4239';

interface EnrichedListing extends Listing {
  fav: boolean;
  priceFmt: string;
  ratingFmt: string;
}

export default function PhoneApp() {
  // Demo state lives in memory — see lib/demo-store.ts. Mutations apply
  // immediately and last until the page is reloaded.
  const store = useDemoStore();
  const { listings, profile, requests, favoriteIds, userEmail, isGuest } = store;

  // Per-user slices of the demo data.
  const myListings = listings.filter((l) => l.owner_id === profile.id);
  const myListingIds = new Set(myListings.map((l) => l.id));
  const hostRequests = requests.filter((r) => myListingIds.has(r.listing_id));
  const myRequests = requests.filter((r) => r.requester_id === profile.id);

  // ── navigation + ephemeral UI state (mirrors the prototype's DCLogic) ──────
  const [screen, setScreen] = useState<Screen>('home');
  const [tab, setTab] = useState<Screen>('home');
  const [hist, setHist] = useState<Screen[]>([]);
  const [sel, setSel] = useState<string>(listings[0]?.id ?? 'l1');

  const [exView, setExView] = useState<'list' | 'map'>('list');
  const [type, setType] = useState<string>('Alle');
  const [query, setQuery] = useState('');

  const [bStep, setBStep] = useState(0);
  const [bMsg, setBMsg] = useState('');
  const [bName, setBName] = useState(profile.name);
  const [bPhone, setBPhone] = useState('');
  const [bReqId, setBReqId] = useState('');

  const [hType, setHType] = useState('Bod');
  const [hSize, setHSize] = useState(8);
  const [hArea, setHArea] = useState('Grünerløkka');
  const [hPublished, setHPublished] = useState(false);

  const [dashTab, setDashTab] = useState<'listings' | 'requests'>('listings');

  // All screens share one scroll container, so a new screen would otherwise
  // inherit the previous one's offset.
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [screen, bStep]);

  // ── helpers ────────────────────────────────────────────────────────────────
  const isFav = (id: string) => favoriteIds.includes(id);

  function enrich(l: Listing): EnrichedListing {
    return {
      ...l,
      fav: isFav(l.id),
      priceFmt: fmt(l.price),
      ratingFmt: Number(l.rating).toFixed(1),
    };
  }

  const selListing = () => listings.find((l) => l.id === sel) ?? listings[0];

  function go(next: Screen, id?: string) {
    const push = next === 'detail' || next === 'booking' || next === 'auth';
    setHist((h) => (push ? [...h, screen] : h));
    if (id !== undefined) setSel(id);
    if (next === 'booking') setBStep(0);
    if (TAB_SCREENS.includes(next)) setTab(next);
    setScreen(next);
  }

  // Browsing works with no account; actions that write data (favourite, book,
  // publish) route a guest to the login screen first.
  function requireAuth(action: () => void) {
    if (isGuest) { go('auth'); return; }
    action();
  }

  function back() {
    setHist((h) => {
      const copy = [...h];
      const prev = copy.pop() ?? 'home';
      setScreen(prev);
      if (TAB_SCREENS.includes(prev)) setTab(prev);
      return copy;
    });
  }

  function tabGo(next: Screen) {
    setScreen(next);
    setTab(next);
    setHist([]);
  }

  function handleToggleFav(id: string) {
    requireAuth(() => store.toggleFavorite(id));
  }

  function handleSignIn(name: string, email: string) {
    store.signIn(name, email);
    back();
  }

  function handleSignOut() {
    store.signOut();
    tabGo('home');
  }

  // Popular areas, derived live from the actual listing set.
  function popularAreas() {
    const byArea = new Map<string, { name: string; city: string; count: number }>();
    for (const l of listings) {
      const key = `${l.area}·${l.city}`;
      const cur = byArea.get(key) ?? { name: l.area, city: l.city, count: 0 };
      cur.count += 1;
      byArea.set(key, cur);
    }
    return [...byArea.values()].sort((a, b) => b.count - a.count).slice(0, 5);
  }

  function sendRequest() {
    const l = selListing();
    const reqId = store.createRequest({
      listingId: l.id,
      listingNum: l.num,
      fromName: bName,
      fromPhone: bPhone,
      message: bMsg || 'Hei! Jeg er interessert i plassen.',
    });
    setBReqId(reqId);
    setBStep(3);
  }

  function bookingPrimary() {
    if (bStep === 2) sendRequest();
    else setBStep((s) => Math.min(3, s + 1));
  }

  function filtered(): Listing[] {
    const q = query.trim().toLowerCase();
    return listings.filter(
      (l) =>
        (type === 'Alle' || l.type === type) &&
        (!q || (l.title + l.area + l.type + l.city).toLowerCase().includes(q)),
    );
  }

  const tcol = (k: Screen) => (tab === k ? CLAY : '#A99E8C');

  // ── shared atoms ───────────────────────────────────────────────────────────
  const EmptyState = ({ title, sub, cta }: { title: string; sub: string; cta?: { label: string; onTap: () => void } }) => (
    <div style={{ margin: '12px 20px 0', background: '#fff', border: `1px dashed ${BORDER}`, borderRadius: 18, padding: '28px 22px', textAlign: 'center' }}>
      <div style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.2 }}>{title}</div>
      <p style={{ margin: '8px 0 0', fontSize: 13, lineHeight: 1.5, color: MUTED }}>{sub}</p>
      {cta && (
        <button onClick={cta.onTap} style={{ marginTop: 16, background: CLAY, color: '#fff', border: 'none', borderRadius: 999, padding: '11px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{cta.label}</button>
      )}
    </div>
  );

  const Star = ({ size = 12 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 12 12">
      <path
        d="M6 1l1.5 3 3.3.3-2.5 2.2.8 3.2L6 9.2 2.9 9.9l.8-3.2L1.2 4.3l3.3-.3z"
        fill={CLAY}
      />
    </svg>
  );

  const Verified = ({ size = 15 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <path
        d="M8 1l1.8 1.3 2.2-.1.7 2.1 1.8 1.3-.7 2.1.7 2.1-1.8 1.3-.7 2.1-2.2-.1L8 15l-1.8-1.3-2.2.1-.7-2.1L1.5 10l.7-2.1-.7-2.1 1.8-1.3.7-2.1 2.2.1z"
        fill="#3E7C57"
      />
      <path
        d="M5.5 8l1.7 1.7L10.7 6"
        stroke="#fff"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const Heart = ({ filled, stroke = '#8C8275', size = 16 }: { filled: boolean; stroke?: string; size?: number }) =>
    filled ? (
      <svg width={size} height={size} viewBox="0 0 18 18">
        <path d="M9 16C-2 9 3 2 9 6c6-4 11 3 0 10z" fill={CLAY} />
      </svg>
    ) : (
      <svg width={size} height={size} viewBox="0 0 18 18">
        <path d="M9 16C-2 9 3 2 9 6c6-4 11 3 0 10z" fill="none" stroke={stroke} strokeWidth="1.6" />
      </svg>
    );

  // ── HOME ───────────────────────────────────────────────────────────────────
  function Home() {
    const featured = listings.slice(0, 5).map(enrich);
    const areas = popularAreas();
    return (
      <div>
        {/* top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '58px 20px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: INK, position: 'relative', display: 'grid', placeItems: 'center' }}>
              <div style={{ width: 13, height: 10, border: `2px solid ${CLAY}`, borderBottom: 0, borderRadius: '3px 3px 0 0', marginBottom: 2 }} />
            </div>
            <span style={{ fontFamily: SERIF, fontSize: 22, lineHeight: 1 }}>Nabolager</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 999, padding: '6px 11px', fontSize: 12, fontWeight: 500 }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: CLAY }} />
              {profile.city}
            </div>
            <div style={{ width: 34, height: 34, borderRadius: 999, background: '#E9E0D2', border: '1px solid #D9D0C0', display: 'grid', placeItems: 'center', fontFamily: SERIF, fontSize: 16 }}>
              {profile.initials}
            </div>
          </div>
        </div>

        {/* guest notice */}
        {isGuest && (
          <div style={{ margin: '14px 20px 0', display: 'flex', alignItems: 'center', gap: 12, background: '#F5E6DC', border: '1px solid #E9C7B8', borderRadius: 14, padding: '12px 14px' }}>
            <span style={{ flex: 1, fontSize: 12.5, lineHeight: 1.5, color: '#8A5236' }}>Du ser en demoversjon. Logg inn for å lagre favoritter, sende forespørsler og legge ut annonser.</span>
            <button onClick={() => go('auth')} style={{ flexShrink: 0, background: CLAY, color: '#fff', border: 'none', borderRadius: 999, padding: '9px 14px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>Logg inn</button>
          </div>
        )}

        {/* hero */}
        <div style={{ padding: '14px 20px 6px' }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.18em', color: MUTED, textTransform: 'uppercase' }}>Lager fra nabolaget</div>
          <h1 style={{ margin: '8px 0 0', fontFamily: SERIF, fontWeight: 400, fontSize: 39, lineHeight: 1.12, letterSpacing: '-.01em' }}>
            Plass til alt du eier — <span style={{ fontStyle: 'italic', color: CLAY }}>rett rundt hjørnet.</span>
          </h1>
        </div>

        {/* search */}
        <div onClick={() => go('explore')} style={{ margin: '16px 20px 0', display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 16, padding: '14px 16px', boxShadow: '0 1px 2px rgba(33,28,22,.04)', cursor: 'pointer' }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="8" cy="8" r="6" stroke={MUTED} strokeWidth="1.8" /><path d="M13 13l3 3" stroke={MUTED} strokeWidth="1.8" strokeLinecap="round" /></svg>
          <span style={{ color: MUTED, fontSize: 15 }}>Søk etter bod, garasje, loft …</span>
        </div>

        {/* type chips */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '16px 20px 4px' }}>
          {LISTING_TYPES.slice(1).map((t) => (
            <button key={t} onClick={() => { setType(t); go('explore'); }} style={{ flex: '0 0 auto', background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 999, padding: '9px 16px', fontSize: 13, fontWeight: 500, color: BODY, cursor: 'pointer', whiteSpace: 'nowrap' }}>{t}</button>
          ))}
        </div>

        {/* featured */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '20px 20px 12px' }}>
          <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 400, fontSize: 25 }}>Utvalgte plasser</h2>
          <button onClick={() => go('explore')} style={{ background: 'none', border: 'none', fontSize: 13, fontWeight: 500, color: CLAY, cursor: 'pointer' }}>Se alle</button>
        </div>
        {featured.length === 0 && (
          <EmptyState title="Ingen plasser ennå" sub="Bli den første som legger ut lager i nabolaget." cta={{ label: 'Legg ut plass', onTap: () => go('host') }} />
        )}
        <div style={{ display: 'flex', gap: 14, overflowX: 'auto', padding: '0 20px 8px' }}>
          {featured.map((l) => (
            <div key={l.id} onClick={() => go('detail', l.id)} style={{ flex: '0 0 250px', cursor: 'pointer' }}>
              <div style={{ position: 'relative', height: 172, borderRadius: 16, overflow: 'hidden', background: 'repeating-linear-gradient(135deg, #E7DECF 0 10px, #EFE7D9 10px 20px)' }}>
                <div style={{ position: 'absolute', top: 11, left: 11, display: 'flex', gap: 6 }}>
                  <span style={{ background: 'rgba(255,255,255,.92)', borderRadius: 999, padding: '5px 10px', fontSize: 11, fontWeight: 600 }}>{l.type}</span>
                </div>
                <div onClick={(e) => { e.stopPropagation(); handleToggleFav(l.id); }} style={{ position: 'absolute', top: 11, right: 11, width: 32, height: 32, borderRadius: 999, background: 'rgba(255,255,255,.92)', display: 'grid', placeItems: 'center' }}>
                  <Heart filled={l.fav} />
                </div>
                <div style={{ position: 'absolute', left: 12, bottom: 10, fontFamily: SERIF, fontSize: 15, color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,.5)' }}>№{l.num}</div>
                <div style={{ position: 'absolute', right: 12, bottom: 10, fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,.92)', background: 'rgba(33,28,22,.34)', padding: '3px 7px', borderRadius: 5 }}>{l.ph}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginTop: 11 }}>
                <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.25 }}>{l.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, whiteSpace: 'nowrap' }}><Star />{l.ratingFmt}</div>
              </div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: MUTED, marginTop: 4, textTransform: 'uppercase', letterSpacing: '.04em' }}>{l.area}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 8 }}>
                <span style={{ fontSize: 12, color: '#8C8275' }}>{l.size_m2} m² · {l.size_m3} m³</span>
                <span style={{ fontFamily: SERIF, fontSize: 21 }}>{l.priceFmt}<span style={{ fontSize: 11, color: '#8C8275', fontFamily: SANS }}> kr/mnd</span></span>
              </div>
            </div>
          ))}
        </div>

        {/* popular areas */}
        {areas.length > 0 && (
        <div style={{ padding: '22px 20px 10px' }}>
          <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 400, fontSize: 25 }}>Populære områder</h2>
        </div>
        )}
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column' }}>
          {areas.map((a) => (
            <button key={a.name} onClick={() => go('explore')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 0', border: 'none', borderBottom: `1px solid ${BORDER}`, background: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 16s6-5.2 6-9.5A6 6 0 003 6.5C3 10.8 9 16 9 16z" stroke={CLAY} strokeWidth="1.6" /><circle cx="9" cy="6.5" r="2" fill={CLAY} /></svg>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 500 }}>{a.name}</div>
                  <div style={{ fontFamily: MONO, fontSize: 11, color: MUTED }}>{a.city}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontFamily: MONO, fontSize: 12, color: '#8C8275' }}>{a.count} plasser</span>
                <svg width="7" height="12" viewBox="0 0 7 12"><path d="M1 1l5 5-5 5" stroke="#C9BFAE" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
              </div>
            </button>
          ))}
        </div>

        {/* host CTA */}
        <div style={{ margin: '24px 20px 0', borderRadius: 20, overflow: 'hidden', background: INK, color: SAND, padding: '24px 22px' }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: CLAY }}>Bli vert</div>
          <h3 style={{ margin: '10px 0 0', fontFamily: SERIF, fontWeight: 400, fontSize: 27, lineHeight: 1.1 }}>Har du en bod eller garasje som står tom?</h3>
          <p style={{ margin: '10px 0 18px', fontSize: 13, lineHeight: 1.5, color: 'rgba(244,239,231,.72)' }}>La naboen leie den. Tjen noen tusenlapper i måneden på plass du likevel ikke bruker.</p>
          <button onClick={() => go('host')} style={{ background: CLAY, color: '#fff', border: 'none', borderRadius: 999, padding: '13px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Regn ut hva du kan tjene →</button>
        </div>

        <p style={{ margin: '22px 20px 0', fontSize: 11, lineHeight: 1.6, color: MUTED }}>
          <b style={{ color: '#6B6253' }}>Nabolager er en formidlingstjeneste.</b> Avtalen inngås direkte mellom utleier og leietaker. Vi er ikke part i avtalen.
        </p>
        <div style={{ height: 110 }} />
      </div>
    );
  }

  // ── EXPLORE ──────────────────────────────────────────────────────────────────
  function Explore() {
    const results = filtered().map(enrich);
    return (
      <div>
        <div style={{ padding: '58px 20px 6px' }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.18em', color: MUTED, textTransform: 'uppercase' }}>{results.length} plasser i nærheten</div>
          <h1 style={{ margin: '6px 0 0', fontFamily: SERIF, fontWeight: 400, fontSize: 34 }}>Utforsk</h1>
        </div>

        <div style={{ padding: '14px 20px 0', display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 9, background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '11px 14px' }}>
            <svg width="17" height="17" viewBox="0 0 18 18" fill="none"><circle cx="8" cy="8" r="6" stroke={MUTED} strokeWidth="1.8" /><path d="M13 13l3 3" stroke={MUTED} strokeWidth="1.8" strokeLinecap="round" /></svg>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Søk område, type …" style={{ flex: 1, border: 'none', outline: 'none', background: 'none', fontFamily: SANS, fontSize: 14, color: INK, minWidth: 0 }} />
          </div>
          <div style={{ display: 'flex', background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, padding: 4, gap: 2 }}>
            <button onClick={() => setExView('list')} style={{ border: 'none', borderRadius: 10, padding: '8px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: exView === 'list' ? INK : 'transparent', color: exView === 'list' ? '#fff' : '#8C8275' }}>Liste</button>
            <button onClick={() => setExView('map')} style={{ border: 'none', borderRadius: 10, padding: '8px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: exView === 'map' ? INK : 'transparent', color: exView === 'map' ? '#fff' : '#8C8275' }}>Kart</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '14px 20px 4px' }}>
          {LISTING_TYPES.map((t) => {
            const active = type === t;
            return (
              <button key={t} onClick={() => setType(t)} style={{ flex: '0 0 auto', border: `1px solid ${active ? INK : BORDER}`, borderRadius: 999, padding: '8px 15px', fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', background: active ? INK : '#fff', color: active ? '#fff' : BODY }}>{t}</button>
            );
          })}
        </div>

        {exView === 'list' ? (
          <div style={{ padding: '12px 20px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {results.map((l) => (
              <div key={l.id} onClick={() => go('detail', l.id)} style={{ display: 'flex', gap: 14, background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 18, padding: 12, cursor: 'pointer', boxShadow: '0 1px 2px rgba(33,28,22,.03)' }}>
                <div style={{ position: 'relative', flex: '0 0 96px', height: 96, borderRadius: 12, overflow: 'hidden', background: 'repeating-linear-gradient(135deg, #E7DECF 0 9px, #EFE7D9 9px 18px)' }}>
                  <div style={{ position: 'absolute', left: 7, bottom: 6, fontFamily: SERIF, fontSize: 13, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,.5)' }}>№{l.num}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: CLAY }}>{l.type}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12 }}><Star size={11} />{l.ratingFmt}</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.25, marginTop: 3 }}>{l.title}</div>
                  <div style={{ fontFamily: MONO, fontSize: 11, color: MUTED, marginTop: 3 }}>{l.area}, {l.city} · {l.size_m2} m²</div>
                  <div style={{ marginTop: 'auto', paddingTop: 7, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: '#3E7C57', fontWeight: 600 }}>{l.avail}</span>
                    <span style={{ fontFamily: SERIF, fontSize: 20 }}>{l.priceFmt}<span style={{ fontSize: 10, color: '#8C8275', fontFamily: SANS }}> kr/mnd</span></span>
                  </div>
                </div>
              </div>
            ))}
            <div style={{ height: 120 }} />
          </div>
        ) : (
          <div style={{ padding: '14px 20px 0' }}>
            <div style={{ position: 'relative', height: 430, borderRadius: 20, overflow: 'hidden', border: `1px solid ${BORDER}`, background: 'radial-gradient(circle at 28% 32%, #E6EDDD 0%, transparent 38%), radial-gradient(circle at 72% 64%, #E4E9E6 0%, transparent 42%), linear-gradient(180deg, #EFEAE0 0%, #E9E2D5 100%)' }}>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(transparent 49.5%, rgba(33,28,22,.05) 49.5% 50.5%, transparent 50.5%), linear-gradient(90deg, transparent 49.5%, rgba(33,28,22,.05) 49.5% 50.5%, transparent 50.5%)', backgroundSize: '54px 54px' }} />
              {results.map((l) => (
                <button key={l.id} onClick={() => go('detail', l.id)} style={{ position: 'absolute', left: `${l.coords?.x ?? 50}%`, top: `${l.coords?.y ?? 50}%`, transform: 'translate(-50%,-100%)', background: INK, color: '#fff', border: 'none', padding: '6px 11px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 4px 10px rgba(33,28,22,.25)' }}>{l.priceFmt} kr</button>
              ))}
              <div style={{ position: 'absolute', left: 14, bottom: 14, right: 14, background: 'rgba(252,250,246,.92)', backdropFilter: 'blur(10px)', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 16s6-5.2 6-9.5A6 6 0 003 6.5C3 10.8 9 16 9 16z" stroke={CLAY} strokeWidth="1.6" /><circle cx="9" cy="6.5" r="2" fill={CLAY} /></svg>
                <span style={{ fontSize: 12, color: '#6B6253' }}>Trykk på en pris for å se plassen</span>
              </div>
            </div>
            <div style={{ height: 120 }} />
          </div>
        )}
      </div>
    );
  }

  // ── DETAIL ───────────────────────────────────────────────────────────────────
  function Detail() {
    const l = enrich(selListing());
    const photos = [l.ph, 'inngangsparti', 'innvendig', 'omgivelser'];
    return (
      <div>
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory' }}>
            {photos.map((cap, i) => (
              <div key={i} style={{ position: 'relative', flex: '0 0 100%', scrollSnapAlign: 'start', height: 320, background: 'repeating-linear-gradient(135deg, #E7DECF 0 11px, #EFE7D9 11px 22px)' }}>
                <div style={{ position: 'absolute', right: 12, bottom: 12, fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,.92)', background: 'rgba(33,28,22,.34)', padding: '4px 8px', borderRadius: 6 }}>{cap}</div>
              </div>
            ))}
          </div>
          <button onClick={back} style={{ position: 'absolute', top: 56, left: 16, width: 38, height: 38, borderRadius: 999, background: 'rgba(252,250,246,.92)', backdropFilter: 'blur(8px)', border: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,.12)' }}>
            <svg width="11" height="18" viewBox="0 0 12 20" fill="none"><path d="M10 2L2 10l8 8" stroke={INK} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <div style={{ position: 'absolute', top: 56, right: 16, display: 'flex', gap: 8 }}>
            <div onClick={() => handleToggleFav(l.id)} style={{ width: 38, height: 38, borderRadius: 999, background: 'rgba(252,250,246,.92)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,.12)' }}>
              <Heart filled={l.fav} stroke={INK} size={17} />
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 14, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6 }}>
            {photos.map((_, i) =>
              i === 0 ? (
                <span key={i} style={{ width: 18, height: 6, borderRadius: 999, background: '#fff' }} />
              ) : (
                <span key={i} style={{ width: 6, height: 6, borderRadius: 999, background: 'rgba(255,255,255,.6)' }} />
              ),
            )}
          </div>
        </div>

        <div style={{ padding: '18px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: CLAY, whiteSpace: 'nowrap' }}>{l.type} · №{l.num}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}><Star size={13} />{l.ratingFmt} <span style={{ color: MUTED }}>({l.reviews})</span></span>
          </div>
          <h1 style={{ margin: '12px 0 0', fontFamily: SERIF, fontWeight: 400, fontSize: 29, lineHeight: 1.2 }}>{l.title}</h1>
          <div style={{ fontFamily: MONO, fontSize: 12, color: MUTED, marginTop: 8 }}>{l.area}, {l.city} · {l.distance}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 14, background: '#E4EFE7', color: '#2E6646', borderRadius: 999, padding: '6px 12px', fontSize: 12, fontWeight: 600 }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: '#3E7C57' }} />{l.avail}
          </div>
        </div>

        <div style={{ padding: '18px 20px 0', display: 'flex', gap: 10 }}>
          {[
            { v: l.size_m2, k: 'm² gulv' },
            { v: l.size_m3, k: 'm³ volum' },
            { v: l.reviews, k: 'vurderinger' },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '14px 12px', textAlign: 'center' }}>
              <div style={{ fontFamily: SERIF, fontSize: 26, lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontFamily: MONO, fontSize: 10, color: MUTED, marginTop: 5, textTransform: 'uppercase', letterSpacing: '.06em' }}>{s.k}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: '24px 20px 0' }}>
          <h3 style={{ margin: '0 0 8px', fontFamily: SERIF, fontWeight: 400, fontSize: 21 }}>Om plassen</h3>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: BODY }}>{l.description}</p>
        </div>

        <div style={{ padding: '22px 20px 0' }}>
          <h3 style={{ margin: '0 0 12px', fontFamily: SERIF, fontWeight: 400, fontSize: 21 }}>Dette er inkludert</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {l.features.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '11px 12px' }}>
                <svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="#E4EFE7" /><path d="M4.5 8l2.2 2.2L11.5 5.5" stroke="#3E7C57" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <span style={{ fontSize: 12.5, color: BODY }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '22px 20px 0' }}>
          <h3 style={{ margin: '0 0 8px', fontFamily: SERIF, fontWeight: 400, fontSize: 21 }}>Tilgang</h3>
          <p style={{ margin: '0 0 18px', fontSize: 14, lineHeight: 1.6, color: BODY }}>{l.access}</p>
          <h3 style={{ margin: '0 0 10px', fontFamily: SERIF, fontWeight: 400, fontSize: 21 }}>Husregler</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {l.rules.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: BODY }}>
                <span style={{ width: 5, height: 5, borderRadius: 999, background: CLAY }} />{r}
              </div>
            ))}
          </div>
        </div>

        <div style={{ margin: '24px 20px 0', background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 18, padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 999, background: '#E9E0D2', border: '1px solid #D9D0C0', display: 'grid', placeItems: 'center', fontFamily: SERIF, fontSize: 22 }}>{l.host_initials}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 16, fontWeight: 600 }}>{l.host_name}</span>
                {l.host_verified && <Verified />}
              </div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: MUTED, marginTop: 3 }}>Vert siden {l.host_since} · ★ {Number(l.host_rating).toFixed(1)}</div>
            </div>
            <button onClick={() => requireAuth(() => go('booking', l.id))} style={{ background: SAND, border: `1px solid ${BORDER}`, borderRadius: 999, padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: INK }}>Melding</button>
          </div>
        </div>

        <div style={{ margin: '20px 20px 0', height: 140, borderRadius: 18, overflow: 'hidden', border: `1px solid ${BORDER}`, position: 'relative', background: 'radial-gradient(circle at 40% 40%, #E6EDDD 0%, transparent 40%), linear-gradient(180deg, #EFEAE0 0%, #E9E2D5 100%)' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(transparent 49.5%, rgba(33,28,22,.05) 49.5% 50.5%, transparent 50.5%), linear-gradient(90deg, transparent 49.5%, rgba(33,28,22,.05) 49.5% 50.5%, transparent 50.5%)', backgroundSize: '44px 44px' }} />
          <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-100%)', background: CLAY, color: '#fff', padding: '6px 11px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>№{l.num}</div>
        </div>

        <p style={{ margin: '18px 20px 0', fontSize: 11, lineHeight: 1.6, color: MUTED }}>
          <b style={{ color: '#6B6253' }}>Formidlingstjeneste.</b> Avtale, pris og betaling avtales direkte med {l.host_name}.
        </p>
        <div style={{ height: 120 }} />
      </div>
    );
  }

  // ── BOOKING ──────────────────────────────────────────────────────────────────
  function Booking() {
    const l = enrich(selListing());
    const showBar = bStep < 3;
    return (
      <div>
        <div style={{ padding: '56px 20px 0', display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => (bStep === 0 ? back() : setBStep((s) => s - 1))} style={{ width: 38, height: 38, borderRadius: 999, background: '#fff', border: `1px solid ${BORDER}`, display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
            <svg width="11" height="18" viewBox="0 0 12 20" fill="none"><path d="M10 2L2 10l8 8" stroke={INK} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          {showBar && (
            <div style={{ flex: 1, display: 'flex', gap: 8 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 999, display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 600, background: i < bStep ? '#3E7C57' : i === bStep ? INK : BORDER, color: i <= bStep ? '#fff' : MUTED }}>{i + 1}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {bStep === 0 && (
          <div style={{ padding: '22px 20px 0' }}>
            <h1 style={{ margin: '0 0 4px', fontFamily: SERIF, fontWeight: 400, fontSize: 30 }}>Send forespørsel</h1>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: MUTED }}>Steg 1 av 3 — periode og melding</p>
            <div style={{ display: 'flex', gap: 13, background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 16, padding: 12, marginBottom: 22 }}>
              <div style={{ flex: '0 0 64px', height: 64, borderRadius: 11, background: 'repeating-linear-gradient(135deg, #E7DECF 0 8px, #EFE7D9 8px 16px)' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{l.title}</div>
                <div style={{ fontFamily: MONO, fontSize: 11, color: MUTED, marginTop: 3 }}>{l.area}, {l.city}</div>
                <div style={{ fontFamily: SERIF, fontSize: 18, marginTop: 5 }}>{l.priceFmt}<span style={{ fontSize: 11, color: '#8C8275', fontFamily: SANS }}> kr/mnd</span></div>
              </div>
            </div>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: MUTED, marginBottom: 10 }}>Når trenger du plassen?</div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
              {[{ k: 'Fra', v: '15. mai 2026' }, { k: 'Til', v: '15. aug 2026' }].map((d) => (
                <div key={d.k} style={{ flex: 1, background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 13, padding: '12px 14px' }}>
                  <div style={{ fontSize: 10, color: MUTED, textTransform: 'uppercase', letterSpacing: '.06em' }}>{d.k}</div>
                  <div style={{ fontSize: 15, fontWeight: 500, marginTop: 3 }}>{d.v}</div>
                </div>
              ))}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: MUTED, marginBottom: 10 }}>Melding til vert</div>
            <textarea value={bMsg} onChange={(e) => setBMsg(e.target.value)} placeholder="Hei! Jeg er interessert i plassen — er den ledig i perioden over?" style={{ width: '100%', boxSizing: 'border-box', minHeight: 110, resize: 'none', background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, padding: 14, fontFamily: SANS, fontSize: 14, color: INK, outline: 'none', lineHeight: 1.5 }} />
            <div style={{ height: 130 }} />
          </div>
        )}

        {bStep === 1 && (
          <div style={{ padding: '22px 20px 0' }}>
            <h1 style={{ margin: '0 0 4px', fontFamily: SERIF, fontWeight: 400, fontSize: 30 }}>Din informasjon</h1>
            <p style={{ margin: '0 0 22px', fontSize: 13, color: MUTED }}>Steg 2 av 3 — så verten kan kontakte deg</p>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: MUTED, marginBottom: 9 }}>Navn</div>
            <input value={bName} onChange={(e) => setBName(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 13, padding: 14, fontFamily: SANS, fontSize: 15, color: INK, outline: 'none', marginBottom: 18 }} />
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: MUTED, marginBottom: 9 }}>Telefon</div>
            <input value={bPhone} onChange={(e) => setBPhone(e.target.value)} placeholder="+47 ..." style={{ width: '100%', boxSizing: 'border-box', background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 13, padding: 14, fontFamily: SANS, fontSize: 15, color: INK, outline: 'none', marginBottom: 18 }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#F5E6DC', borderRadius: 14, padding: 14 }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, marginTop: 1 }}><path d="M9 1l7 3v4c0 4-3 7-7 8-4-1-7-4-7-8V4l7-3z" stroke={CLAY} strokeWidth="1.5" fill="none" /></svg>
              <div style={{ fontSize: 12, lineHeight: 1.5, color: '#8A5236' }}>Telefonnummeret ditt deles først når verten godtar forespørselen. Frem til da snakker dere via meldinger i appen.</div>
            </div>
            <div style={{ height: 130 }} />
          </div>
        )}

        {bStep === 2 && (
          <div style={{ padding: '22px 20px 0' }}>
            <h1 style={{ margin: '0 0 4px', fontFamily: SERIF, fontWeight: 400, fontSize: 30 }}>Oppsummering</h1>
            <p style={{ margin: '0 0 22px', fontSize: 13, color: MUTED }}>Steg 3 av 3 — se over før du sender</p>
            <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 16, padding: '4px 16px' }}>
              {[
                { k: 'Plass', v: l.title, narrow: false },
                { k: 'Vert', v: l.host_name, narrow: true },
                { k: 'Periode', v: '15. mai – 15. aug', narrow: true },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #EFE9DD' }}>
                  <span style={{ color: MUTED, fontSize: 13 }}>{row.k}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, textAlign: 'right', maxWidth: row.narrow ? undefined : '60%', whiteSpace: row.narrow ? 'nowrap' : undefined }}>{row.v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0' }}>
                <span style={{ color: MUTED, fontSize: 13 }}>Pris</span>
                <span style={{ fontFamily: SERIF, fontSize: 20 }}>{l.priceFmt} kr/mnd</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 18, background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, padding: 14 }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="9" cy="9" r="8" stroke={MUTED} strokeWidth="1.4" /><path d="M9 5v5M9 12.5v.5" stroke={MUTED} strokeWidth="1.6" strokeLinecap="round" /></svg>
              <div style={{ fontSize: 12, lineHeight: 1.55, color: '#6B6253' }}>Nabolager er en <b>formidlingstjeneste</b>. Endelig avtale, pris og betaling avtales direkte mellom deg og {l.host_name}. Du forplikter deg ikke til noe ved å sende forespørselen.</div>
            </div>
            <div style={{ height: 130 }} />
          </div>
        )}

        {bStep === 3 && (
          <div style={{ padding: '60px 28px 0', textAlign: 'center' }}>
            <div style={{ width: 76, height: 76, borderRadius: 999, background: '#E4EFE7', display: 'grid', placeItems: 'center', margin: '0 auto' }}>
              <svg width="36" height="36" viewBox="0 0 36 36"><path d="M9 18.5l5.5 5.5L27 11" stroke="#3E7C57" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <h1 style={{ margin: '24px 0 0', fontFamily: SERIF, fontWeight: 400, fontSize: 32, lineHeight: 1.1 }}>Forespørsel sendt!</h1>
            <p style={{ margin: '12px auto 0', maxWidth: 280, fontSize: 14, lineHeight: 1.6, color: BODY }}>{l.host_name} får beskjed nå. Du hører vanligvis tilbake innen et døgn — svaret kommer i Meldinger.</p>
            <div style={{ display: 'inline-block', marginTop: 20, fontFamily: MONO, fontSize: 12, color: MUTED, background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 999, padding: '8px 16px', whiteSpace: 'nowrap' }}>Forespørsel-ID · {bReqId}</div>
            <button onClick={() => tabGo('home')} style={{ display: 'block', width: '100%', margin: '32px 0 0', background: INK, color: '#fff', border: 'none', borderRadius: 999, padding: 16, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Til forsiden</button>
          </div>
        )}
      </div>
    );
  }

  // ── HOST / BLI VERT ──────────────────────────────────────────────────────────
  function Host() {
    const rate = HOST_RATES[hType] ?? 80;
    const est = Math.round((hSize * rate) / 10) * 10;
    const estRange = `${fmt(Math.round((est * 0.85) / 10) * 10)}–${fmt(Math.round((est * 1.15) / 10) * 10)}`;
    function publish() {
      store.publishListing({ type: hType, sizeM2: hSize, area: hArea, price: est });
      setHPublished(true);
    }
    if (hPublished) {
      return (
        <div style={{ padding: '70px 28px 0', textAlign: 'center' }}>
          <div style={{ width: 76, height: 76, borderRadius: 999, background: '#E4EFE7', display: 'grid', placeItems: 'center', margin: '0 auto' }}>
            <svg width="36" height="36" viewBox="0 0 36 36"><path d="M9 18.5l5.5 5.5L27 11" stroke="#3E7C57" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <h1 style={{ margin: '24px 0 0', fontFamily: SERIF, fontWeight: 400, fontSize: 32, lineHeight: 1.1 }}>Annonsen er publisert!</h1>
          <p style={{ margin: '12px auto 0', maxWidth: 280, fontSize: 14, lineHeight: 1.6, color: BODY }}>Plassen din i {hArea} er nå synlig for naboer. Du finner den under Mine annonser.</p>
          <button onClick={() => { setHPublished(false); tabGo('dash'); }} style={{ display: 'block', width: '100%', margin: '30px 0 12px', background: INK, color: '#fff', border: 'none', borderRadius: 999, padding: 16, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Gå til Mine annonser</button>
          <button onClick={() => setHPublished(false)} style={{ background: 'none', border: 'none', color: '#8C8275', fontSize: 14, fontWeight: 500, cursor: 'pointer', padding: 8 }}>Legg ut en til</button>
        </div>
      );
    }
    return (
      <div>
        <div style={{ padding: '58px 20px 0' }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.18em', color: CLAY, textTransform: 'uppercase' }}>Bli vert</div>
          <h1 style={{ margin: '6px 0 0', fontFamily: SERIF, fontWeight: 400, fontSize: 34, lineHeight: 1.06 }}>Tjen på plassen <span style={{ fontStyle: 'italic', color: CLAY }}>du ikke bruker.</span></h1>
        </div>

        <div style={{ margin: '22px 20px 0', background: INK, color: SAND, borderRadius: 22, padding: 22 }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(244,239,231,.55)' }}>Hva slags plass har du?</div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginTop: 12 }}>
            {['Bod', 'Garasje', 'Loft', 'Container', 'Industri'].map((t) => {
              const active = hType === t;
              return (
                <button key={t} onClick={() => setHType(t)} style={{ flex: '0 0 auto', border: `1px solid ${active ? INK : BORDER}`, borderRadius: 999, padding: '8px 15px', fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', background: active ? INK : '#fff', color: active ? '#fff' : BODY }}>{t}</button>
              );
            })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 22 }}>
            <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(244,239,231,.55)' }}>Størrelse</span>
            <span style={{ fontFamily: SERIF, fontSize: 22 }}>{hSize} m²</span>
          </div>
          <input type="range" min={2} max={40} value={hSize} onChange={(e) => setHSize(Number(e.target.value))} style={{ width: '100%', marginTop: 12, accentColor: CLAY }} />
          <div style={{ borderTop: '1px solid rgba(244,239,231,.14)', marginTop: 20, paddingTop: 20, textAlign: 'center' }}>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(244,239,231,.55)' }}>Anslått inntekt</div>
            <div style={{ fontFamily: SERIF, fontSize: 48, lineHeight: 1.05, marginTop: 6 }}>{fmt(est)}<span style={{ fontSize: 18, color: 'rgba(244,239,231,.6)', fontFamily: SANS }}> kr/mnd</span></div>
            <div style={{ fontSize: 12, color: 'rgba(244,239,231,.55)', marginTop: 4 }}>Naboer i nærheten betaler {estRange} kr/mnd</div>
          </div>
        </div>

        <div style={{ padding: '28px 20px 0' }}>
          <h2 style={{ margin: '0 0 16px', fontFamily: SERIF, fontWeight: 400, fontSize: 24 }}>Slik fungerer det</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { n: 1, t: 'Beskriv plassen', d: 'Type, størrelse, bilder og hva som er inkludert.' },
              { n: 2, t: 'Få forespørsler', d: 'Naboer sender melding. Du velger hvem du vil leie til.' },
              { n: 3, t: 'Avtal direkte', d: 'Dere blir enige om pris og overlevering. Nabolager formidler bare.' },
            ].map((s) => (
              <div key={s.n} style={{ display: 'flex', gap: 14 }}>
                <div style={{ flex: '0 0 30px', height: 30, borderRadius: 9, background: '#F5E6DC', color: CLAY, display: 'grid', placeItems: 'center', fontFamily: MONO, fontWeight: 500, fontSize: 14 }}>{s.n}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{s.t}</div>
                  <div style={{ fontSize: 13, color: '#8C8275', marginTop: 2, lineHeight: 1.5 }}>{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '28px 20px 0' }}>
          <h2 style={{ margin: '0 0 14px', fontFamily: SERIF, fontWeight: 400, fontSize: 24 }}>Legg ut annonsen</h2>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: MUTED, marginBottom: 9 }}>Område</div>
          <input value={hArea} onChange={(e) => setHArea(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 13, padding: 14, fontFamily: SANS, fontSize: 15, color: INK, outline: 'none', marginBottom: 18 }} />
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: MUTED, marginBottom: 9 }}>Bilder</div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 6 }}>
            <div style={{ flex: 1, height: 80, borderRadius: 13, border: '1.5px dashed #D9D0C0', display: 'grid', placeItems: 'center', background: '#FBF8F2' }}><svg width="22" height="22" viewBox="0 0 24 24"><path d="M12 6v12M6 12h12" stroke="#C9BFAE" strokeWidth="2" strokeLinecap="round" /></svg></div>
            <div style={{ flex: 1, height: 80, borderRadius: 13, background: 'repeating-linear-gradient(135deg, #E7DECF 0 8px, #EFE7D9 8px 16px)' }} />
            <div style={{ flex: 1, height: 80, borderRadius: 13, background: 'repeating-linear-gradient(135deg, #E7DECF 0 8px, #EFE7D9 8px 16px)' }} />
          </div>
          <button onClick={() => requireAuth(publish)} style={{ width: '100%', marginTop: 26, background: CLAY, color: '#fff', border: 'none', borderRadius: 999, padding: 16, fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 14px rgba(194,104,63,.28)' }}>Publiser annonse</button>
        </div>
        <div style={{ height: 120 }} />
      </div>
    );
  }

  // ── DASHBOARD ────────────────────────────────────────────────────────────────
  function Dashboard() {
    const mine = myListings;
    const reqCountFor = (id: string) => hostRequests.filter((r) => r.listing_id === id).length;
    const pendingCount = hostRequests.filter((r) => r.status === 'pending').length;
    const kpiViews = mine.reduce((s, l) => s + l.views, 0);
    const kpiIncome = mine.filter((l) => l.status === 'rented').reduce((s, l) => s + l.price, 0);

    const titleFor = (id: string) => listings.find((l) => l.id === id)?.title ?? '';
    const initialsOf = (name: string) => name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');

    function act(r: RequestRow, status: 'accepted' | 'declined') {
      store.setRequestStatus(r.id, status);
    }

    const isList = dashTab === 'listings';
    return (
      <div>
        <div style={{ padding: '58px 20px 0' }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.18em', color: MUTED, textTransform: 'uppercase' }}>Vert · {profile.name}</div>
          <h1 style={{ margin: '6px 0 0', fontFamily: SERIF, fontWeight: 400, fontSize: 34 }}>Mine annonser</h1>
        </div>

        <div style={{ padding: '18px 20px 0', display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, background: INK, color: SAND, borderRadius: 16, padding: '15px 13px' }}>
            <div style={{ fontFamily: SERIF, fontSize: 25, lineHeight: 1 }}>{fmt(kpiIncome)}</div>
            <div style={{ fontFamily: MONO, fontSize: 9.5, color: 'rgba(244,239,231,.6)', marginTop: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>kr i mnd</div>
          </div>
          {[{ v: kpiViews, k: 'visninger' }, { v: hostRequests.length, k: 'forespørsler' }].map((kpi, i) => (
            <div key={i} style={{ flex: 1, background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 16, padding: '15px 13px' }}>
              <div style={{ fontFamily: SERIF, fontSize: 25, lineHeight: 1 }}>{kpi.v}</div>
              <div style={{ fontFamily: MONO, fontSize: 9.5, color: MUTED, marginTop: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>{kpi.k}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: '18px 20px 0' }}>
          <div style={{ display: 'flex', background: '#EDE6D8', borderRadius: 13, padding: 4, gap: 4 }}>
            <button onClick={() => setDashTab('listings')} style={{ flex: 1, border: 'none', borderRadius: 10, padding: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: isList ? '#fff' : 'transparent', color: isList ? INK : '#8C8275', boxShadow: isList ? '0 1px 3px rgba(33,28,22,.08)' : 'none' }}>Annonser</button>
            <button onClick={() => setDashTab('requests')} style={{ flex: 1, border: 'none', borderRadius: 10, padding: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: !isList ? '#fff' : 'transparent', color: !isList ? INK : '#8C8275', boxShadow: !isList ? '0 1px 3px rgba(33,28,22,.08)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              Forespørsler <span style={{ background: CLAY, color: '#fff', borderRadius: 999, minWidth: 18, height: 18, padding: '0 5px', fontSize: 11, display: 'inline-grid', placeItems: 'center' }}>{pendingCount}</span>
            </button>
          </div>
        </div>

        {isList ? (
          <div style={{ padding: '16px 20px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mine.length === 0 && (
              <EmptyState title="Ingen annonser ennå" sub="Legg ut en bod, garasje eller loft og begynn å tjene på plass du ikke bruker." cta={{ label: 'Legg ut plass', onTap: () => go('host') }} />
            )}
            {mine.map((l) => {
              const statusActive = l.status === 'active';
              return (
                <div key={l.id} onClick={() => go('detail', l.id)} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 18, padding: 14, cursor: 'pointer' }}>
                  <div style={{ display: 'flex', gap: 13 }}>
                    <div style={{ position: 'relative', flex: '0 0 76px', height: 76, borderRadius: 12, overflow: 'hidden', background: 'repeating-linear-gradient(135deg, #E7DECF 0 8px, #EFE7D9 8px 16px)' }}>
                      <div style={{ position: 'absolute', left: 6, bottom: 5, fontFamily: SERIF, fontSize: 12, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,.5)' }}>№{l.num}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: CLAY }}>{l.type}</span>
                        <span style={{ background: statusActive ? '#E4EFE7' : '#EDE5D6', color: statusActive ? '#2E6646' : '#6B6253', borderRadius: 999, padding: '4px 10px', fontSize: 11, fontWeight: 600 }}>{statusActive ? 'Aktiv' : 'Utleid'}</span>
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4, lineHeight: 1.25 }}>{l.title}</div>
                      <div style={{ fontFamily: SERIF, fontSize: 18, marginTop: 4 }}>{fmt(l.price)}<span style={{ fontSize: 11, color: '#8C8275', fontFamily: SANS }}> kr/mnd</span></div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 22, marginTop: 13, paddingTop: 13, borderTop: '1px solid #EFE9DD' }}>
                    <div style={{ fontFamily: MONO, fontSize: 11, color: '#8C8275' }}><b style={{ fontFamily: SANS, color: INK, fontSize: 14 }}>{l.views}</b> visninger</div>
                    <div style={{ fontFamily: MONO, fontSize: 11, color: '#8C8275' }}><b style={{ fontFamily: SANS, color: INK, fontSize: 14 }}>{reqCountFor(l.id)}</b> forespørsler</div>
                  </div>
                </div>
              );
            })}
            <div style={{ height: 120 }} />
          </div>
        ) : (
          <div style={{ padding: '16px 20px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {hostRequests.length === 0 && (
              <EmptyState title="Ingen forespørsler" sub="Når naboer sender forespørsel på plassene dine, dukker de opp her." />
            )}
            {hostRequests.map((r) => {
              const status = r.status;
              return (
                <div key={r.id} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 18, padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 999, background: '#E9E0D2', border: '1px solid #D9D0C0', display: 'grid', placeItems: 'center', fontFamily: SERIF, fontSize: 17 }}>{initialsOf(r.from_name)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>{r.from_name}</div>
                      <div style={{ fontFamily: MONO, fontSize: 11, color: MUTED, marginTop: 2 }}>{r.time_label ?? 'Nettopp'}</div>
                    </div>
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.06em', textTransform: 'uppercase', color: CLAY, marginTop: 13 }}>{titleFor(r.listing_id)}</div>
                  <p style={{ margin: '6px 0 0', fontSize: 13.5, lineHeight: 1.5, color: BODY }}>«{r.message}»</p>
                  {status === 'pending' && (
                    <div style={{ display: 'flex', gap: 10, marginTop: 15 }}>
                      <button onClick={() => act(r, 'declined')} style={{ flex: 1, background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 999, padding: 11, fontSize: 13, fontWeight: 600, color: '#6B6253', cursor: 'pointer' }}>Avslå</button>
                      <button onClick={() => act(r, 'accepted')} style={{ flex: 1, background: INK, border: 'none', borderRadius: 999, padding: 11, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>Godta</button>
                    </div>
                  )}
                  {status === 'accepted' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 15, background: '#E4EFE7', borderRadius: 12, padding: '11px 14px', fontSize: 13, fontWeight: 600, color: '#2E6646' }}>
                      <svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="#3E7C57" /><path d="M4.5 8l2.2 2.2L11.5 5.5" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>Godtatt — telefonnummer delt
                    </div>
                  )}
                  {status === 'declined' && (
                    <div style={{ marginTop: 15, background: '#F1EBE0', borderRadius: 12, padding: '11px 14px', fontSize: 13, fontWeight: 500, color: '#8C8275' }}>Avslått</div>
                  )}
                </div>
              );
            })}
            <div style={{ height: 120 }} />
          </div>
        )}
      </div>
    );
  }

  // ── PROFILE ──────────────────────────────────────────────────────────────────
  function Profile() {
    const statusMap: Record<string, { label: string; bg: string; col: string }> = {
      accepted: { label: 'Aktiv', bg: '#E4EFE7', col: '#2E6646' },
      pending: { label: 'Venter', bg: '#F5E6DC', col: '#8A5236' },
      declined: { label: 'Avslått', bg: '#F1EBE0', col: '#8C8275' },
    };
    const bookings = myRequests.map((r) => {
      const l = listings.find((x) => x.id === r.listing_id);
      const s = statusMap[r.status] ?? statusMap.pending;
      return {
        key: r.id,
        num: l?.num ?? '—',
        title: l?.title ?? 'Plass',
        period: r.period_from && r.period_to ? `${r.period_from} – ${r.period_to}` : r.time_label ?? '',
        label: s.label,
        bg: s.bg,
        col: s.col,
        id: r.listing_id,
      };
    });
    const tenancyCount = myRequests.filter((r) => r.status === 'accepted').length;
    const settings = [
      { label: 'Konto og verifisering', ic: '#F5E6DC' },
      { label: 'Varsler', ic: '#E4EFE7' },
      { label: 'Betaling og utbetaling', ic: '#F5E6DC' },
      { label: 'Personvern', ic: '#E4EFE7' },
      { label: 'Hjelp og support', ic: '#F5E6DC' },
    ];
    return (
      <div>
        <div style={{ padding: '58px 20px 0' }}>
          <h1 style={{ margin: 0, fontFamily: SERIF, fontWeight: 400, fontSize: 34 }}>Profil</h1>
        </div>

        <div style={{ margin: '18px 20px 0', background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 20, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: 999, background: INK, color: SAND, display: 'grid', placeItems: 'center', fontFamily: SERIF, fontSize: 28 }}>{profile.initials}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: 19, fontWeight: 600 }}>{profile.name}</span>
                <Verified size={16} />
              </div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: MUTED, marginTop: 4 }}>{isGuest ? 'Ikke innlogget' : (userEmail ?? `Medlem siden ${profile.member_since}`)}</div>
            </div>
          </div>
          <div style={{ display: 'flex', marginTop: 18, paddingTop: 18, borderTop: '1px solid #EFE9DD' }}>
            {[
              { v: tenancyCount, k: 'leieforhold', border: false },
              { v: myListings.length, k: 'som vert', border: true },
              { v: Number(profile.rating).toFixed(1), k: 'vurdering', border: false },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center', borderLeft: s.border ? '1px solid #EFE9DD' : undefined, borderRight: s.border ? '1px solid #EFE9DD' : undefined }}>
                <div style={{ fontFamily: SERIF, fontSize: 24 }}>{s.v}</div>
                <div style={{ fontFamily: MONO, fontSize: 9.5, color: MUTED, marginTop: 3, textTransform: 'uppercase', letterSpacing: '.05em' }}>{s.k}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '26px 20px 0' }}>
          <h2 style={{ margin: '0 0 14px', fontFamily: SERIF, fontWeight: 400, fontSize: 24 }}>Mine leieforhold</h2>
          {bookings.length === 0 && (
            <div style={{ background: '#fff', border: `1px dashed ${BORDER}`, borderRadius: 16, padding: '22px', textAlign: 'center', fontSize: 13, color: MUTED, lineHeight: 1.5 }}>
              Ingen leieforhold ennå. Finn en plass under Utforsk og send en forespørsel.
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {bookings.map((b) => (
              <div key={b.key} onClick={() => go('detail', b.id)} style={{ display: 'flex', alignItems: 'center', gap: 13, background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 16, padding: 13, cursor: 'pointer' }}>
                <div style={{ position: 'relative', flex: '0 0 56px', height: 56, borderRadius: 11, overflow: 'hidden', background: 'repeating-linear-gradient(135deg, #E7DECF 0 8px, #EFE7D9 8px 16px)' }}>
                  <div style={{ position: 'absolute', left: 5, bottom: 4, fontFamily: SERIF, fontSize: 11, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,.5)' }}>№{b.num}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{b.title}</div>
                  <div style={{ fontFamily: MONO, fontSize: 11, color: MUTED, marginTop: 3 }}>{b.period}</div>
                </div>
                <span style={{ background: b.bg, color: b.col, borderRadius: 999, padding: '5px 11px', fontSize: 11, fontWeight: 600 }}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '26px 20px 0' }}>
          <h2 style={{ margin: '0 0 14px', fontFamily: SERIF, fontWeight: 400, fontSize: 24 }}>Innstillinger</h2>
          <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden' }}>
            {settings.map((s, i) => (
              <button key={s.label} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 13, padding: '15px 16px', background: 'none', border: 'none', borderBottom: i < settings.length - 1 ? '1px solid #EFE9DD' : 'none', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ width: 30, height: 30, borderRadius: 9, background: s.ic, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 15, color: INK }}>{s.label}</span>
                <svg width="7" height="12" viewBox="0 0 7 12"><path d="M1 1l5 5-5 5" stroke="#C9BFAE" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '22px 20px 0' }}>
          {isGuest ? (
            <button onClick={() => go('auth')} style={{ width: '100%', background: CLAY, border: 'none', borderRadius: 14, padding: 15, fontSize: 15, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>Logg inn</button>
          ) : (
            <button onClick={handleSignOut} style={{ width: '100%', background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, padding: 15, fontSize: 15, fontWeight: 600, color: '#B23A2E', cursor: 'pointer' }}>Logg ut</button>
          )}
          <button onClick={() => { store.reset(); tabGo('home'); }} style={{ width: '100%', marginTop: 10, background: 'none', border: 'none', color: '#8C8275', fontSize: 13, fontWeight: 500, cursor: 'pointer', padding: 10 }}>Nullstill demodata</button>
          <div style={{ textAlign: 'center', fontFamily: MONO, fontSize: 10, color: '#B8AE9C', marginTop: 12 }}>NABOLAGER v1.0 · DEMO UTEN DATABASE</div>
        </div>
        <div style={{ height: 120 }} />
      </div>
    );
  }

  // ── tab bar ──────────────────────────────────────────────────────────────────
  const showTabBar = TAB_SCREENS.includes(screen);

  function TabBar() {
    const TabBtn = ({ s, label, children, mt }: { s: Screen; label: string; children: React.ReactNode; mt?: number }) => (
      <button onClick={() => tabGo(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 60, marginTop: mt }}>
        {children}
        <span style={{ fontSize: 10, fontWeight: 500, color: tcol(s) }}>{label}</span>
      </button>
    );
    return (
      <div style={{ flex: '0 0 auto', background: 'rgba(252,250,246,.92)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderTop: `1px solid ${BORDER}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-around', padding: '10px 8px 24px' }}>
        <TabBtn s="home" label="Hjem">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 11l8-6 8 6v8a1 1 0 01-1 1h-4v-5h-6v5H5a1 1 0 01-1-1z" stroke={tcol('home')} strokeWidth="1.7" strokeLinejoin="round" /></svg>
        </TabBtn>
        <TabBtn s="explore" label="Utforsk">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="10.5" cy="10.5" r="6.5" stroke={tcol('explore')} strokeWidth="1.7" /><path d="M15.5 15.5L20 20" stroke={tcol('explore')} strokeWidth="1.7" strokeLinecap="round" /></svg>
        </TabBtn>
        <TabBtn s="host" label="Legg ut" mt={-2}>
          <div style={{ width: 42, height: 32, borderRadius: 11, background: CLAY, display: 'grid', placeItems: 'center', boxShadow: '0 4px 12px rgba(194,104,63,.35)' }}>
            <svg width="20" height="20" viewBox="0 0 20 20"><path d="M10 4v12M4 10h12" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
          </div>
        </TabBtn>
        <TabBtn s="dash" label="Annonser">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="7" height="7" rx="1.5" stroke={tcol('dash')} strokeWidth="1.7" /><rect x="13" y="4" width="7" height="7" rx="1.5" stroke={tcol('dash')} strokeWidth="1.7" /><rect x="4" y="13" width="7" height="7" rx="1.5" stroke={tcol('dash')} strokeWidth="1.7" /><rect x="13" y="13" width="7" height="7" rx="1.5" stroke={tcol('dash')} strokeWidth="1.7" /></svg>
        </TabBtn>
        <TabBtn s="profile" label="Profil">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke={tcol('profile')} strokeWidth="1.7" /><path d="M4.5 20a7.5 7.5 0 0115 0" stroke={tcol('profile')} strokeWidth="1.7" strokeLinecap="round" /></svg>
        </TabBtn>
      </div>
    );
  }

  // ── compose ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: SAND, fontFamily: SANS, color: INK }}>
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {screen === 'home' && <Home />}
        {screen === 'explore' && <Explore />}
        {screen === 'detail' && <Detail />}
        {screen === 'booking' && <Booking />}
        {screen === 'host' && <Host />}
        {screen === 'dash' && <Dashboard />}
        {screen === 'profile' && <Profile />}
        {screen === 'auth' && <AuthScreen onBack={back} onSignIn={handleSignIn} />}
      </div>

      {showTabBar && <TabBar />}

      {screen === 'booking' && bStep < 3 && (
        <div style={{ flex: '0 0 auto', background: 'rgba(252,250,246,.95)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderTop: `1px solid ${BORDER}`, padding: '14px 20px 26px' }}>
          <button onClick={bookingPrimary} style={{ width: '100%', background: CLAY, color: '#fff', border: 'none', borderRadius: 999, padding: 16, fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 14px rgba(194,104,63,.3)' }}>{bStep === 2 ? 'Send forespørsel' : 'Neste'}</button>
        </div>
      )}

      {screen === 'detail' && (
        <div style={{ flex: '0 0 auto', background: 'rgba(252,250,246,.95)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderTop: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: '14px 20px 26px' }}>
          <div>
            <div style={{ fontFamily: SERIF, fontSize: 26, lineHeight: 1 }}>{fmt(selListing().price)}<span style={{ fontSize: 13, color: '#8C8275', fontFamily: SANS }}> kr/mnd</span></div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: MUTED, marginTop: 3, textTransform: 'uppercase' }}>Ingen binding</div>
          </div>
          <button onClick={() => requireAuth(() => go('booking', selListing().id))} style={{ background: CLAY, color: '#fff', border: 'none', borderRadius: 999, padding: '15px 26px', fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 14px rgba(194,104,63,.32)' }}>Send forespørsel</button>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { SERIF, SANS, MONO } from '@/components/fonts';
import type { AppData, PhoneAppActions } from '@/lib/types';
import {
  loadLocalAppData,
  localCreateRequest,
  localPublishListing,
  localSetRequestStatus,
  localSignIn,
  localSignOut,
  localToggleFavorite,
} from '@/lib/local/store';
import PhoneApp from './PhoneApp';

const SAND = '#F4EFE7';
const INK = '#211C16';
const CLAY = '#C2683F';
const BORDER = '#E7E0D4';
const MUTED = '#9A8F7E';
const BODY = '#4A4239';

// Rendered instead of AuthScreen/PhoneApp when no Supabase project is
// configured (NEXT_PUBLIC_SUPABASE_URL/ANON_KEY absent). Everything runs
// client-side against localStorage — see lib/local/store.ts.
export default function LocalApp() {
  const [data, setData] = useState<AppData | null | undefined>(undefined);
  const [name, setName] = useState('');

  useEffect(() => {
    setData(loadLocalAppData());
  }, []);

  if (data === undefined) return null; // avoid a hydration flash before localStorage is read

  if (!data) {
    return (
      <div
        style={{
          height: '100%',
          background: SAND,
          fontFamily: SANS,
          color: INK,
          display: 'flex',
          flexDirection: 'column',
          padding: '0 26px 40px',
          overflowY: 'auto',
        }}
      >
        <div style={{ paddingTop: 92, display: 'flex', alignItems: 'center', gap: 9, marginBottom: 30 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: INK, position: 'relative', display: 'grid', placeItems: 'center' }}>
            <div style={{ width: 13, height: 10, border: `2px solid ${CLAY}`, borderBottom: 0, borderRadius: '3px 3px 0 0', marginBottom: 2 }} />
          </div>
          <span style={{ fontFamily: SERIF, fontSize: 22, lineHeight: 1 }}>Nabolager</span>
        </div>

        <div
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: 1,
            color: '#1a1a1a',
            background: '#E8B84B',
            display: 'inline-block',
            padding: '3px 8px',
            marginBottom: 12,
            alignSelf: 'flex-start',
          }}
        >
          DEMO — fiktive data, ingenting lagres på server
        </div>

        <h1 style={{ margin: '8px 0 14px', fontFamily: SERIF, fontWeight: 400, fontSize: 34, lineHeight: 1.1 }}>
          Velkommen til <span style={{ fontStyle: 'italic', color: CLAY }}>nabolaget.</span>
        </h1>
        <p style={{ margin: '0 0 28px', fontSize: 14, lineHeight: 1.6, color: BODY }}>
          Dette er en demo uten ekte backend — skriv inn et navn for å utforske appen. Alt lagres kun i denne
          nettleseren.
        </p>

        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: MUTED, marginBottom: 9 }}>
          Navn
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && setData(localSignIn(name))}
          placeholder="Ola Nordmann"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            background: '#fff',
            border: `1px solid ${BORDER}`,
            borderRadius: 13,
            padding: 14,
            fontFamily: SANS,
            fontSize: 15,
            color: INK,
            outline: 'none',
            marginBottom: 18,
          }}
        />

        <button
          onClick={() => setData(localSignIn(name))}
          style={{
            width: '100%',
            marginTop: 8,
            background: CLAY,
            color: '#fff',
            border: 'none',
            borderRadius: 999,
            padding: 16,
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(194,104,63,.28)',
          }}
        >
          Utforsk demoen
        </button>

        <p style={{ marginTop: 'auto', paddingTop: 28, fontSize: 11, lineHeight: 1.6, color: MUTED }}>
          Ingen e-post eller passord — dette navnet brukes bare til å merke dine egne forespørsler og annonser i
          demoen.
        </p>
      </div>
    );
  }

  const actions: PhoneAppActions = {
    toggleFavorite: async (id, next) => {
      await localToggleFavorite(id, next);
      setData(loadLocalAppData());
    },
    createRequest: async (input) => {
      const r = await localCreateRequest(input);
      setData(loadLocalAppData());
      return r;
    },
    setRequestStatus: async (id, status) => {
      await localSetRequestStatus(id, status);
      setData(loadLocalAppData());
    },
    publishListing: async (input) => {
      const r = await localPublishListing(input);
      setData(loadLocalAppData());
      return r;
    },
    signOut: async () => {
      localSignOut();
      setData(null);
    },
  };

  return <PhoneApp data={data} actions={actions} />;
}

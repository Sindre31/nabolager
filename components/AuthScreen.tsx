'use client';

import { useState } from 'react';
import { SERIF, SANS, MONO } from '@/components/fonts';
import { DEMO_EMAIL, DEMO_PROFILE } from '@/lib/demo-data';

const SAND = '#F4EFE7';
const INK = '#211C16';
const CLAY = '#C2683F';
const BORDER = '#E7E0D4';
const MUTED = '#9A8F7E';
const BODY = '#4A4239';

/**
 * Demo sign-in. There is no backend and no magic link — whatever name and
 * e-post you type signs you straight into the demo account, and the fields
 * are pre-filled so you can just tap the button.
 */
export default function AuthScreen({
  onBack,
  onSignIn,
}: {
  onBack?: () => void;
  onSignIn: (name: string, email: string) => void;
}) {
  const [name, setName] = useState(DEMO_PROFILE.name);
  const [email, setEmail] = useState(DEMO_EMAIL);

  const labelStyle = {
    fontFamily: MONO,
    fontSize: 11,
    letterSpacing: '.08em',
    textTransform: 'uppercase' as const,
    color: MUTED,
    marginBottom: 9,
  };
  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box' as const,
    background: '#fff',
    border: `1px solid ${BORDER}`,
    borderRadius: 13,
    padding: 14,
    fontFamily: SANS,
    fontSize: 15,
    color: INK,
    outline: 'none',
    marginBottom: 18,
  };

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
      <div style={{ paddingTop: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {onBack ? (
          <button onClick={onBack} style={{ width: 38, height: 38, borderRadius: 999, background: '#fff', border: `1px solid ${BORDER}`, display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
            <svg width="11" height="18" viewBox="0 0 12 20" fill="none"><path d="M10 2L2 10l8 8" stroke={INK} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        ) : <span />}
      </div>

      <div style={{ paddingTop: 36, display: 'flex', alignItems: 'center', gap: 9, marginBottom: 30 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: INK, position: 'relative', display: 'grid', placeItems: 'center' }}>
          <div style={{ width: 13, height: 10, border: `2px solid ${CLAY}`, borderBottom: 0, borderRadius: '3px 3px 0 0', marginBottom: 2 }} />
        </div>
        <span style={{ fontFamily: SERIF, fontSize: 22, lineHeight: 1 }}>Nabolager</span>
      </div>

      <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.18em', color: CLAY, textTransform: 'uppercase' }}>Logg inn</div>
      <h1 style={{ margin: '8px 0 14px', fontFamily: SERIF, fontWeight: 400, fontSize: 34, lineHeight: 1.1 }}>
        Velkommen til <span style={{ fontStyle: 'italic', color: CLAY }}>nabolaget.</span>
      </h1>
      <p style={{ margin: '0 0 28px', fontSize: 14, lineHeight: 1.6, color: BODY }}>
        Dette er en demo — ingen e-post sendes og ingenting lagres. Trykk på knappen, så er du inne
        i demokontoen med annonser, favoritter og forespørsler.
      </p>

      <div style={labelStyle}>Navn</div>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ola Nordmann" style={inputStyle} />

      <div style={labelStyle}>E-post</div>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSignIn(name, email)}
        placeholder="deg@epost.no"
        type="email"
        autoCapitalize="off"
        autoCorrect="off"
        style={inputStyle}
      />

      <button
        onClick={() => onSignIn(name, email)}
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
        Logg inn i demoen
      </button>

      <p style={{ marginTop: 'auto', paddingTop: 28, fontSize: 11, lineHeight: 1.6, color: MUTED }}>
        Demoversjon uten database. <b style={{ color: '#6B6253' }}>Nabolager er en formidlingstjeneste</b> —
        avtaler inngås direkte mellom nabo og nabo.
      </p>
    </div>
  );
}

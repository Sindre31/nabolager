'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { SERIF, SANS, MONO } from '@/components/fonts';

const SAND = '#F4EFE7';
const INK = '#211C16';
const CLAY = '#C2683F';
const BORDER = '#E7E0D4';
const MUTED = '#9A8F7E';
const BODY = '#4A4239';

export default function AuthScreen({ onBack }: { onBack?: () => void } = {}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  async function sendLink() {
    if (!email.trim()) return;
    setStatus('sending');
    setError('');
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        shouldCreateUser: true,
        data: name.trim() ? { name: name.trim() } : undefined,
      },
    });
    if (error) {
      setError(error.message);
      setStatus('error');
    } else {
      setStatus('sent');
    }
  }

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

      {status === 'sent' ? (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ width: 76, height: 76, borderRadius: 999, background: '#E4EFE7', display: 'grid', placeItems: 'center', marginBottom: 24 }}>
            <svg width="34" height="34" viewBox="0 0 36 36"><path d="M4 9l14 10L32 9M4 9h28v18H4z" stroke="#3E7C57" strokeWidth="2.4" fill="none" strokeLinejoin="round" /></svg>
          </div>
          <h1 style={{ margin: '0 0 12px', fontFamily: SERIF, fontWeight: 400, fontSize: 34, lineHeight: 1.1 }}>Sjekk e-posten din</h1>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: BODY }}>
            Vi sendte en innloggingslenke til <b>{email}</b>. Åpne den på denne enheten for å logge inn.
          </p>
          <button
            onClick={() => setStatus('idle')}
            style={{ marginTop: 26, alignSelf: 'flex-start', background: 'none', border: 'none', color: CLAY, fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: 0 }}
          >
            Bruk en annen e-post
          </button>
        </div>
      ) : (
        <>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.18em', color: CLAY, textTransform: 'uppercase' }}>Logg inn</div>
          <h1 style={{ margin: '8px 0 14px', fontFamily: SERIF, fontWeight: 400, fontSize: 34, lineHeight: 1.1 }}>
            Velkommen til <span style={{ fontStyle: 'italic', color: CLAY }}>nabolaget.</span>
          </h1>
          <p style={{ margin: '0 0 28px', fontSize: 14, lineHeight: 1.6, color: BODY }}>
            Skriv inn e-posten din, så sender vi en lenke du logger inn med. Ny her? Da oppretter vi en konto automatisk.
          </p>

          <div style={labelStyle}>Navn <span style={{ textTransform: 'none', letterSpacing: 0 }}>(valgfritt)</span></div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ola Nordmann" style={inputStyle} />

          <div style={labelStyle}>E-post</div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendLink()}
            placeholder="deg@epost.no"
            type="email"
            autoCapitalize="off"
            autoCorrect="off"
            style={inputStyle}
          />

          {status === 'error' && (
            <div style={{ background: '#F8E3DC', border: '1px solid #E9C7B8', borderRadius: 12, padding: '11px 14px', fontSize: 12.5, color: '#8A5236', lineHeight: 1.5, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button
            onClick={sendLink}
            disabled={status === 'sending' || !email.trim()}
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
              cursor: status === 'sending' || !email.trim() ? 'default' : 'pointer',
              opacity: status === 'sending' || !email.trim() ? 0.6 : 1,
              boxShadow: '0 4px 14px rgba(194,104,63,.28)',
            }}
          >
            {status === 'sending' ? 'Sender …' : 'Send innloggingslenke'}
          </button>

          <p style={{ marginTop: 'auto', paddingTop: 28, fontSize: 11, lineHeight: 1.6, color: MUTED }}>
            Ved å logge inn godtar du vilkårene. <b style={{ color: '#6B6253' }}>Nabolager er en formidlingstjeneste</b> — avtaler inngås direkte mellom nabo og nabo.
          </p>
        </>
      )}
    </div>
  );
}

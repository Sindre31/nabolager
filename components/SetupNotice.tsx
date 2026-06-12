import { SERIF, SANS, MONO } from '@/components/fonts';

const SAND = '#F4EFE7';
const INK = '#211C16';
const CLAY = '#C2683F';
const BORDER = '#E7E0D4';
const MUTED = '#9A8F7E';
const BODY = '#4A4239';

export default function SetupNotice({
  reason,
  message,
}: {
  reason: 'env' | 'empty' | 'error';
  message?: string;
}) {
  const heading =
    reason === 'env'
      ? 'Koble til Supabase'
      : reason === 'empty'
        ? 'Databasen er tom'
        : 'Tilkoblingsfeil';

  const steps =
    reason === 'empty'
      ? [
          'Åpne SQL Editor i Supabase-prosjektet ditt',
          'Kjør supabase/migrations/0001_init.sql',
          'Kjør supabase/seed.sql',
          'Last siden på nytt',
        ]
      : [
          'Lag et prosjekt på supabase.com',
          'Kopier .env.example til .env.local',
          'Lim inn Project URL og anon-nøkkel',
          'Kjør SQL-en i supabase/, og start npm run dev på nytt',
        ];

  return (
    <div
      style={{
        height: '100%',
        background: SAND,
        fontFamily: SANS,
        color: INK,
        display: 'flex',
        flexDirection: 'column',
        padding: '90px 26px 40px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 26 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: INK, position: 'relative', display: 'grid', placeItems: 'center' }}>
          <div style={{ width: 13, height: 10, border: `2px solid ${CLAY}`, borderBottom: 0, borderRadius: '3px 3px 0 0', marginBottom: 2 }} />
        </div>
        <span style={{ fontFamily: SERIF, fontSize: 22, lineHeight: 1 }}>Nabolager</span>
      </div>

      <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.18em', color: CLAY, textTransform: 'uppercase' }}>
        Oppsett
      </div>
      <h1 style={{ margin: '8px 0 14px', fontFamily: SERIF, fontWeight: 400, fontSize: 34, lineHeight: 1.1 }}>
        {heading}
      </h1>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: BODY }}>
        Appen er klar — den trenger bare en Supabase-database å lese fra og skrive til.
      </p>

      <ol style={{ margin: '22px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {steps.map((s, i) => (
          <li key={i} style={{ display: 'flex', gap: 13, alignItems: 'flex-start' }}>
            <div style={{ flex: '0 0 26px', height: 26, borderRadius: 8, background: '#F5E6DC', color: CLAY, display: 'grid', placeItems: 'center', fontFamily: MONO, fontWeight: 500, fontSize: 13 }}>{i + 1}</div>
            <span style={{ fontSize: 14, lineHeight: 1.5, color: BODY, paddingTop: 3 }}>{s}</span>
          </li>
        ))}
      </ol>

      {message && (
        <div style={{ marginTop: 22, background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '12px 14px', fontFamily: MONO, fontSize: 11, color: MUTED, lineHeight: 1.5, wordBreak: 'break-word' }}>
          {message}
        </div>
      )}

      <p style={{ marginTop: 'auto', fontFamily: MONO, fontSize: 10, color: '#B8AE9C', textTransform: 'uppercase', letterSpacing: '.05em' }}>
        Detaljer i README.md
      </p>
    </div>
  );
}

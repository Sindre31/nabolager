import IOSDevice from '@/components/IOSDevice';
import PhoneApp from '@/components/PhoneApp';
import AuthScreen from '@/components/AuthScreen';
import LocalApp from '@/components/LocalApp';
import { hasSupabaseEnv } from '@/lib/supabase/server';
import { loadAppData } from '@/lib/data';
import * as serverActions from '@/app/actions';

// Always render fresh data (favourites, requests and listings change live).
export const dynamic = 'force-dynamic';

const Stage = ({ children }: { children: React.ReactNode }) => (
  <main
    style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
    }}
  >
    <IOSDevice>{children}</IOSDevice>
  </main>
);

export default async function Page() {
  // No Supabase project wired up (or it's since been torn down) → run as a
  // fully local, no-backend demo instead of dead-ending on a setup screen.
  if (!hasSupabaseEnv()) {
    return (
      <Stage>
        <LocalApp />
      </Stage>
    );
  }

  try {
    const data = await loadAppData();
    // Not signed in → the app is gated behind login/registration.
    if (!data) {
      return (
        <Stage>
          <AuthScreen />
        </Stage>
      );
    }
    return (
      <Stage>
        <PhoneApp data={data} actions={serverActions} />
      </Stage>
    );
  } catch {
    // Supabase env vars are set but the project is unreachable/misconfigured
    // (e.g. torn down) — same fallback as the missing-env case above.
    return (
      <Stage>
        <LocalApp />
      </Stage>
    );
  }
}

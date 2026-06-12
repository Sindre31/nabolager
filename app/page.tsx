import IOSDevice from '@/components/IOSDevice';
import PhoneApp from '@/components/PhoneApp';
import SetupNotice from '@/components/SetupNotice';
import { hasSupabaseEnv } from '@/lib/supabase/server';
import { loadAppData } from '@/lib/data';

// Always render fresh data (favourites, requests and new listings change live).
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
  if (!hasSupabaseEnv()) {
    return (
      <Stage>
        <SetupNotice reason="env" />
      </Stage>
    );
  }

  try {
    const data = await loadAppData();
    if (!data.listings.length) {
      return (
        <Stage>
          <SetupNotice reason="empty" />
        </Stage>
      );
    }
    return (
      <Stage>
        <PhoneApp data={data} />
      </Stage>
    );
  } catch (err) {
    return (
      <Stage>
        <SetupNotice reason="error" message={err instanceof Error ? err.message : String(err)} />
      </Stage>
    );
  }
}

import IOSDevice from '@/components/IOSDevice';
import PhoneApp from '@/components/PhoneApp';

// Nothing to fetch — the app renders from the bundled demo dataset and keeps
// its state in the browser, so this page is fully static.
export default function Page() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
      }}
    >
      <IOSDevice>
        <PhoneApp />
      </IOSDevice>
    </main>
  );
}

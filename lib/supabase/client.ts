import { createBrowserClient } from '@supabase/ssr';

/** Supabase client for the browser (auth calls, client-side reads). */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

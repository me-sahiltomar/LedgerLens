import { createBrowserClient } from '@supabase/ssr';
import { DEFAULT_SUPABASE_URL } from './config';

let browserClientInstance: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Returns a singleton browser Supabase client for client components.
 * Configured using NEXT_PUBLIC_SUPABASE_URL and publishable key.
 * Stores auth session tokens in secure cookies for Next.js SSR coordination.
 */
export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

  if (!browserClientInstance) {
    browserClientInstance = createBrowserClient(url, key, {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }

  return browserClientInstance;
}

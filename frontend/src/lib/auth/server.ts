import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { DEFAULT_SUPABASE_URL } from './config';
import { UserProfile } from './types';

/**
 * Creates a server-side Supabase client for Next.js 14 App Router.
 * Uses synchronous cookies() API standard in Next.js 14.
 */
export function createClient() {
  const cookieStore = cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component; middleware refreshes sessions
        }
      },
    },
  });
}

/**
 * Validates and retrieves the currently authenticated user on the server.
 * Uses auth.getUser() which performs cryptographically verified server-side validation.
 */
export async function getCurrentUser() {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return null;
    }
    return user;
  } catch (err) {
    console.error('Error fetching current user on server:', err);
    return null;
  }
}

/**
 * Retrieves the profile for the currently authenticated user from public.profiles.
 */
export async function getCurrentProfile(): Promise<UserProfile | null> {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const supabase = createClient();
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.warn('Could not fetch user profile from Supabase:', error.message);
      return null;
    }

    return profile;
  } catch (err) {
    console.error('Error fetching profile on server:', err);
    return null;
  }
}

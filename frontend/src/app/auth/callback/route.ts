import { NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';
import { getSafeRedirectPath } from '@/lib/auth/config';

export const dynamic = 'force-dynamic';

/**
 * Central OAuth and Email Verification Callback Handler for LedgerLens
 * 
 * 1. Exchanges OAuth/magic link auth code for Supabase JWT session.
 * 2. Writes session cookies to client browser.
 * 3. Safely redirects to /app or specified internal return path.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const rawNext = searchParams.get('next');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  const safeNext = getSafeRedirectPath(rawNext, '/app');

  if (error) {
    console.error('OAuth callback error:', error, errorDescription);
    const redirectUrl = new URL('/auth/login', origin);
    redirectUrl.searchParams.set('error', errorDescription || error);
    return NextResponse.redirect(redirectUrl);
  }

  if (code) {
    try {
      const supabase = createClient();
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('Session exchange error:', exchangeError.message);
        const redirectUrl = new URL('/auth/login', origin);
        redirectUrl.searchParams.set('error', exchangeError.message);
        return NextResponse.redirect(redirectUrl);
      }

      return NextResponse.redirect(new URL(safeNext, origin));
    } catch (err: any) {
      console.error('Unexpected error during code exchange:', err);
      const redirectUrl = new URL('/auth/login', origin);
      redirectUrl.searchParams.set('error', 'Authentication failed. Please try again.');
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.redirect(new URL('/auth/login', origin));
}

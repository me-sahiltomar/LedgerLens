import { NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';
import { getAppBaseUrl, getSafeRedirectPath } from '@/lib/auth/config';

export const dynamic = 'force-dynamic';

/**
 * Central OAuth and Email Verification Callback Handler for LedgerLens
 * 
 * 1. Exchanges OAuth/magic link auth code for Supabase JWT session.
 * 2. Writes session cookies to client browser.
 * 3. Safely redirects to /app or specified internal return path within LedgerLens.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const rawNext = searchParams.get('next');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/cx_post_auth_dest=([^;]+)/);
  const cookieDest = match ? decodeURIComponent(match[1]) : null;
  const safeNext = getSafeRedirectPath(rawNext || cookieDest, '/app');

  // Derive guaranteed LedgerLens base origin
  const requestUrl = new URL(request.url);
  const isLocal = requestUrl.hostname === 'localhost' || requestUrl.hostname === '127.0.0.1';
  const forwardedHost = request.headers.get('x-forwarded-host');
  const baseOrigin = isLocal
    ? requestUrl.origin
    : forwardedHost && !forwardedHost.includes('products.cevonx.com')
      ? `https://${forwardedHost}`
      : getAppBaseUrl();

  if (error) {
    console.error('OAuth callback error:', error, errorDescription);
    const redirectUrl = new URL('/auth/login', baseOrigin);
    redirectUrl.searchParams.set('error', errorDescription || error);
    return NextResponse.redirect(redirectUrl);
  }

  if (code) {
    try {
      const supabase = createClient();
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('Session exchange error:', exchangeError.message);
        const redirectUrl = new URL('/auth/login', baseOrigin);
        redirectUrl.searchParams.set('error', exchangeError.message);
        return NextResponse.redirect(redirectUrl);
      }

      const response = NextResponse.redirect(new URL(safeNext, baseOrigin));
      response.cookies.delete('cx_post_auth_dest');
      return response;
    } catch (err: any) {
      console.error('Unexpected error during code exchange:', err);
      const redirectUrl = new URL('/auth/login', baseOrigin);
      redirectUrl.searchParams.set('error', 'Authentication failed. Please try again.');
      const response = NextResponse.redirect(redirectUrl);
      response.cookies.delete('cx_post_auth_dest');
      return response;
    }
  }

  const response = NextResponse.redirect(new URL('/auth/login', baseOrigin));
  response.cookies.delete('cx_post_auth_dest');
  return response;
}

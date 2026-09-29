/**
 * LedgerLens (A CevonX Product) — Authentication Configuration
 * 
 * Connects to central CevonX Products Supabase project (gzhiltwyuhclzbhaypzd).
 * Dedicated OAuth callback: https://ledgerlens.cevonx.com/auth/callback
 */

export const PRODUCT_ID = 'cevondocs';
export const PRODUCT_NAME = 'LedgerLens';
export const DEFAULT_SUPABASE_URL = 'https://gzhiltwyuhclzbhaypzd.supabase.co';

/**
 * Returns whether Supabase authentication is properly configured in current environment.
 */
export function isSupabaseAuthConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

  return (
    Boolean(url) &&
    Boolean(key) &&
    !key.includes('your-') &&
    key.length > 20
  );
}

/**
 * Returns the product-specific OAuth callback URL for LedgerLens.
 * 
 * Production destination: https://ledgerlens.cevonx.com/auth/callback
 * Development destination: http://localhost:3000/auth/callback (or current window.location.origin)
 */
export function getProductCallbackUrl(origin?: string): string {
  if (process.env.NEXT_PUBLIC_PRODUCT_CALLBACK_URL) {
    return process.env.NEXT_PUBLIC_PRODUCT_CALLBACK_URL;
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/auth/callback`;
  }

  if (origin) {
    return `${origin.replace(/\/$/, '')}/auth/callback`;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ledgerlens.cevonx.com';
  return `${siteUrl.replace(/\/$/, '')}/auth/callback`;
}

/**
 * Validates that a redirect path is internal and safe against open-redirect attacks.
 * Rejects external URLs, protocol-relative URLs (//evil.com), and backslash payloads.
 */
export function getSafeRedirectPath(candidate: string | null | undefined, fallback = '/app'): string {
  if (!candidate || typeof candidate !== 'string') {
    return fallback;
  }

  const trimmed = candidate.trim();

  // Must begin with single forward slash, must not begin with double slash, must not contain backslash
  if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.includes('\\')) {
    return trimmed;
  }

  return fallback;
}

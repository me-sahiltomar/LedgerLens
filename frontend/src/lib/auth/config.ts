/**
 * LedgerLens (A CevonX Product) — Authentication Configuration
 * 
 * Connects to central CevonX Products Supabase project (gzhiltwyuhclzbhaypzd).
 * Dedicated destination: https://ledgerlens.cevonx.com
 */

export const PRODUCT_ID = 'cevondocs';
export const PRODUCT_NAME = 'LedgerLens';
export const DEFAULT_SUPABASE_URL = 'https://gzhiltwyuhclzbhaypzd.supabase.co';
export const DEFAULT_APP_BASE_URL = 'https://ledgerlens.cevonx.com';

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
 * Resolves the application base URL for LedgerLens.
 * Priority:
 * 1. Client window.location.origin (if in browser)
 * 2. Explicit origin parameter (if valid http/https URL)
 * 3. Environment variables (NEXT_PUBLIC_APP_URL or NEXT_PUBLIC_SITE_URL, strictly rejecting foreign domains like products.cevonx.com)
 * 4. Production canonical default: https://ledgerlens.cevonx.com
 */
export function getAppBaseUrl(origin?: string): string {
  // If running in browser, prioritize current window origin so we always match the host
  if (typeof window !== 'undefined' && window.location?.origin && window.location.origin.startsWith('http')) {
    return window.location.origin.replace(/\/$/, '');
  }

  // If origin explicitly passed
  if (origin && typeof origin === 'string' && origin.startsWith('http')) {
    return origin.replace(/\/$/, '');
  }

  // Environment variable override (safeguard: ignore if pointing to another CevonX product)
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && envUrl.startsWith('http') && !envUrl.includes('products.cevonx.com')) {
    return envUrl.replace(/\/$/, '');
  }

  return DEFAULT_APP_BASE_URL;
}

/**
 * Returns the product-specific OAuth and email verification callback URL for LedgerLens.
 * Production destination: https://ledgerlens.cevonx.com/auth/callback
 */
export function getProductCallbackUrl(origin?: string): string {
  if (
    process.env.NEXT_PUBLIC_PRODUCT_CALLBACK_URL &&
    !process.env.NEXT_PUBLIC_PRODUCT_CALLBACK_URL.includes('products.cevonx.com')
  ) {
    return process.env.NEXT_PUBLIC_PRODUCT_CALLBACK_URL;
  }
  return `${getAppBaseUrl(origin)}/auth/callback`;
}

/**
 * Returns the product-specific password reset destination URL for LedgerLens.
 * Production destination: https://ledgerlens.cevonx.com/auth/reset-password
 */
export function getProductResetPasswordUrl(origin?: string): string {
  return `${getAppBaseUrl(origin)}/auth/reset-password`;
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

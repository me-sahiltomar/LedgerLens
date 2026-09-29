import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { DEFAULT_SUPABASE_URL, isSupabaseAuthConfigured, getSafeRedirectPath } from '@/lib/auth/config';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // If Supabase authentication is not configured in local environment, allow pass-through
  if (!isSupabaseAuthConfigured()) {
    return supabaseResponse;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh auth session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protected route guard: /app and /account require authentication
  if (pathname.startsWith('/app') || pathname.startsWith('/account')) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/auth/login';
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from login / signup pages to /app
  if (user && (pathname === '/auth/login' || pathname === '/auth/signup')) {
    const rawRedirect =
      request.nextUrl.searchParams.get('redirectTo') ||
      request.nextUrl.searchParams.get('next');
    const target = getSafeRedirectPath(rawRedirect, '/app');
    return NextResponse.redirect(new URL(target, request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt, sitemap.xml
     * - public assets (.svg, .png, .jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

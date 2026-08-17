import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabasePublicConfig } from './config';

function applySecurityHeaders(response: NextResponse, supabaseUrl: string) {
  const supabaseOrigin = new URL(supabaseUrl).origin;
  const supabaseWebsocketOrigin = supabaseOrigin
    .replace(/^https:/, 'wss:')
    .replace(/^http:/, 'ws:');
  const developmentConnectSource = process.env.NODE_ENV === 'development' ? ' ws:' : '';
  const developmentScriptSource = process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : '';
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${developmentScriptSource}`,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "img-src 'self' data: blob: https://images.pexels.com https://upload.wikimedia.org https://tile.openstreetmap.org",
    `connect-src 'self'${developmentConnectSource} ${supabaseOrigin} ${supabaseWebsocketOrigin} https://tile.openstreetmap.org`,
    "worker-src 'self' blob:",
    "media-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "manifest-src 'self'",
  ];

  if (process.env.NODE_ENV === 'production') directives.push('upgrade-insecure-requests');
  response.headers.set('Content-Security-Policy', directives.join('; '));
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), payment=(), usb=()',
  );

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, publishableKey } = getSupabasePublicConfig();

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      },
    },
  });

  // Keep this call immediately after creating the SSR client. It verifies and
  // refreshes the token before Server Components read the authenticated user.
  await supabase.auth.getClaims();

  applySecurityHeaders(response, url);

  if (/^\/(?:admin|customer|deliverer)(?:\/|$)/.test(request.nextUrl.pathname)) {
    response.headers.set('Cache-Control', 'private, no-store');
  }

  return response;
}

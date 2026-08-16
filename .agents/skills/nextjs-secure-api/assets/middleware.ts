/**
 * Drop-in Next.js middleware: applies security headers to every response
 * and rejects mutating requests (POST/PUT/PATCH/DELETE) whose Origin doesn't
 * match an allow-listed host.
 *
 * Place this at the project root as `middleware.ts` (or merge its logic into
 * an existing middleware.ts). Adjust ALLOWED_ORIGINS and the CSP to match
 * the project's actual domains and asset sources before shipping.
 */
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ORIGINS = new Set<string>([
  // "https://yourapp.com",
  // "https://www.yourapp.com",
]);

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function isTrustedOrigin(req: NextRequest): boolean {
  if (ALLOWED_ORIGINS.size === 0) return true; // no-op until configured — see note below
  const origin = req.headers.get("origin") ?? req.headers.get("referer");
  if (!origin) return false;
  try {
    return ALLOWED_ORIGINS.has(new URL(origin).origin);
  } catch {
    return false;
  }
}

function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; frame-ancestors 'none'; base-uri 'self'"
  );
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (process.env.NODE_ENV === "production") {
    res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }
  return res;
}

export function middleware(req: NextRequest) {
  // NOTE: ALLOWED_ORIGINS is empty by default so this doesn't silently block
  // requests before it's configured. Fill it in with the project's real
  // domain(s) before relying on the Origin check for CSRF protection.
  if (MUTATING_METHODS.has(req.method) && req.nextUrl.pathname.startsWith("/api/")) {
    if (!isTrustedOrigin(req)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 403 });
    }
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  // Runs on every route by default; narrow this if the project needs
  // middleware to skip static assets, e.g.:
  // matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
  matcher: "/:path*",
};

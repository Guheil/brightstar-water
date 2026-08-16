# Code patterns

Concrete, copy-adaptable patterns for Next.js App Router route handlers (TypeScript). Adjust to `pages/api` syntax if the project uses the older router — the underlying logic is identical, only the request/response objects differ.

## Table of contents
1. Input validation with zod
2. Parameterized SQL queries (mysql2 and Prisma)
3. Server-side HTML sanitization
4. Rate limiting
5. CSRF / Origin verification
6. Security headers
7. Safe redirects (header injection prevention)
8. Session cookies (no localStorage)
9. Generic error handling wrapper

---

## 1. Input validation with zod

```typescript
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

const CreateCommentSchema = z.object({
  postId: z.string().uuid(),
  body: z.string().min(1).max(2000),
});

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = CreateCommentSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { postId, body } = parsed.data;
  // ...proceed only with validated data
}
```

Validate query params the same way with `.parse` on an object built from `searchParams`.

## 2. Parameterized SQL queries

**mysql2** — placeholders only, never template-literal the values in:

```typescript
// Good
const [rows] = await pool.execute(
  "SELECT id, name FROM users WHERE id = ? AND status = ?",
  [userId, status]
);

// Never do this — string interpolation is injectable regardless of how "safe" the value looks
// const [rows] = await pool.query(`SELECT * FROM users WHERE id = ${userId}`);
```

For dynamic sort columns, allow-list rather than pass through:

```typescript
const SORT_COLUMNS = { name: "users.name", created: "users.created_at" } as const;
const sortKey = SORT_COLUMNS[requestedSort as keyof typeof SORT_COLUMNS] ?? SORT_COLUMNS.created;
const [rows] = await pool.query(`SELECT * FROM users ORDER BY ${sortKey} DESC`);
```

**Prisma** — the query builder parameterizes automatically; avoid `$queryRawUnsafe`:

```typescript
const user = await prisma.user.findFirst({
  where: { id: userId, status },
});
```

If a raw query is genuinely required, use `prisma.$queryRaw` with tagged-template parameters (not `$queryRawUnsafe`), which still binds values safely:

```typescript
const rows = await prisma.$queryRaw`SELECT id, name FROM users WHERE id = ${userId}`;
```

## 3. Server-side HTML sanitization

For any field that will later be rendered as HTML (rich text editors, markdown-to-HTML, user bios):

```typescript
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const purify = DOMPurify(window as unknown as Window);

export function sanitizeHtml(dirty: string): string {
  return purify.sanitize(dirty, { ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "br"] });
}
```

Sanitize on write (before storing), not only on read — this keeps every consumer of the data safe, not just the one render path you remembered to escape.

## 4. Rate limiting

Route handlers are stateless across invocations, so use a shared store. Prefer the bundled `assets/rateLimiter.ts`, used like:

```typescript
import { checkRateLimit } from "@/lib/rateLimiter";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { success, retryAfter } = await checkRateLimit(`login:${ip}`, { limit: 5, windowSeconds: 60 });

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }
  // ...
}
```

Use a tighter `limit`/`windowSeconds` for login, signup, password reset, and OTP routes than for general reads.

## 5. CSRF / Origin verification

For any POST/PUT/PATCH/DELETE route:

```typescript
const ALLOWED_ORIGINS = new Set([
  "https://yourapp.com",
  "https://www.yourapp.com",
]);

function isTrustedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin") ?? req.headers.get("referer");
  if (!origin) return false;
  try {
    return ALLOWED_ORIGINS.has(new URL(origin).origin);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!isTrustedOrigin(req)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 403 });
  }
  // ...
}
```

This is bundled globally in `assets/middleware.ts` so individual routes don't need to repeat it — call it out per-route only if a route has an unusual trust boundary (e.g. a public webhook, which needs its own verification scheme like a signature header instead).

## 6. Security headers

Apply centrally so every route inherits them — see `assets/middleware.ts` for the full version. Core shape:

```typescript
function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; frame-ancestors 'none'; base-uri 'self'"
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
```

Tighten the CSP (`script-src`, `style-src`, `img-src`, `connect-src`) to match what the app actually loads — a wide-open `default-src 'self'` is a starting point, not a finished policy.

## 7. Safe redirects (header injection prevention)

Never redirect to a raw client-supplied URL, and never build a header value by concatenating user input:

```typescript
const SAFE_REDIRECT_PATHS = new Set(["/dashboard", "/onboarding", "/settings"]);

function safeRedirectPath(requested: string | null): string {
  if (requested && SAFE_REDIRECT_PATHS.has(requested)) return requested;
  return "/dashboard"; // fallback, never the raw input
}

export async function GET(req: NextRequest) {
  const target = safeRedirectPath(req.nextUrl.searchParams.get("next"));
  return NextResponse.redirect(new URL(target, req.url));
}
```

If input must appear in a header at all (rare — e.g. echoing a request ID), strip `\r`/`\n` first and prefer a fixed, server-generated value instead of trusting the client's.

## 8. Session cookies (no localStorage)

Use the bundled `assets/session.ts` pattern: sign a token server-side, set it as an `httpOnly` cookie, never return it in a JSON body for the client to store itself.

```typescript
import { createSession, destroySession } from "@/lib/session";

export async function POST(req: NextRequest) {
  // ...after verifying credentials
  const res = NextResponse.json({ ok: true });
  await createSession(res, { userId: user.id, role: user.role });
  return res;
}

export async function DELETE(req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  await destroySession(res);
  return res;
}
```

The client never sees the raw token and never needs to — the browser attaches the `httpOnly` cookie automatically on same-site requests. If the frontend needs to know "am I logged in", expose that via a lightweight `/api/me` endpoint reading the session server-side, not by having the client inspect a token.

## 9. Generic error handling wrapper

```typescript
export async function POST(req: NextRequest) {
  try {
    // ...route logic
  } catch (err) {
    console.error("[POST /api/whatever]", err); // full detail server-side only
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
```

Never spread `err.message` or `err.stack` into the JSON response body — log it, don't ship it.

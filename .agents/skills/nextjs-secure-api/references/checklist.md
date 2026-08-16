# Per-endpoint security checklist

Walk through every section for each route. Mark items N/A with a one-line reason when they genuinely don't apply — don't skip silently. See `code-patterns.md` for the concrete implementation of any item below.

## 1. Input validation & sanitization
- [ ] Every value read from `req.body`, query params, route params, headers, or cookies is validated against a schema (type, shape, length, format) before use
- [ ] Validation failure returns a 400 immediately — invalid input never reaches business logic
- [ ] Any field that will be rendered as HTML elsewhere (rich text, markdown, user bios) is sanitized server-side before it's stored, not just before it's displayed
- [ ] Numeric/enum fields (IDs, statuses, roles) are checked against allowed values or ranges, not just "is a number"
- [ ] File uploads (if any) validate MIME type, extension, and size server-side — not just on the client

## 2. SQL / database injection
- [ ] Every query uses parameterized placeholders or an ORM's typed query builder — zero string concatenation or template-literal interpolation of user input into SQL
- [ ] Dynamic sort/filter/column selection uses an allow-list mapping (e.g. `{"name": "users.name", "date": "users.created_at"}`) rather than passing the client's string directly
- [ ] Table/column names are never built from user input, even indirectly
- [ ] If raw/dynamic queries are unavoidable, the escaping mechanism is the driver's own parameter binding, not manual string escaping

## 3. XSS
- [ ] No `dangerouslySetInnerHTML` (or equivalent raw-HTML render) with unsanitized user content
- [ ] Any server-rendered HTML built from user input (emails, PDFs, markdown output) is sanitized with an HTML sanitizer, not just escaped once and trusted
- [ ] JSON responses set `Content-Type: application/json` explicitly (prevents some content-sniffing based XSS vectors)
- [ ] A Content-Security-Policy is set globally (see section 6) as defense-in-depth

## 4. Rate limiting
- [ ] The route is covered by rate limiting (either globally in middleware or per-route for sensitive endpoints)
- [ ] Sensitive routes (login, signup, password reset, OTP verification, any endpoint that sends email/SMS) have a tighter limit than general read endpoints
- [ ] The rate limit key includes something that survives a changed IP where relevant (e.g. account identifier for login attempts) so it can't be trivially bypassed by rotating IPs alone, while still keying on IP for anonymous routes
- [ ] Rate-limited responses return `429` with a `Retry-After` header, not a silent failure or generic 500

## 5. CSRF / request origin
- [ ] State-changing routes (POST/PUT/PATCH/DELETE) verify `Origin` (or `Referer` as fallback) against an allow-list of expected hosts
- [ ] Auth cookies are set with `SameSite=Lax` or `Strict` (not `None` unless there's a specific, justified cross-site use case, in which case CSRF tokens are added instead)
- [ ] Requests with a missing or mismatched Origin on a mutating route are rejected, not passed through

## 6. Security headers
- [ ] `Content-Security-Policy` is set (at minimum restricting `default-src`, `script-src`, `frame-ancestors`)
- [ ] `X-Content-Type-Options: nosniff` is set
- [ ] `X-Frame-Options: DENY` or equivalent `frame-ancestors 'none'` in CSP
- [ ] `Referrer-Policy` is set (e.g. `strict-origin-when-cross-origin`)
- [ ] `Permissions-Policy` restricts unused browser features (camera, microphone, geolocation, etc.)
- [ ] `Strict-Transport-Security` is set in production
- [ ] These are applied centrally (middleware / `next.config.js` headers) so new routes inherit them automatically, not copy-pasted per route

## 7. Header & redirect injection
- [ ] No response header value is built by directly interpolating user input
- [ ] Any redirect (`Location` header / `NextResponse.redirect`) that depends on user input validates the target against an allow-list of internal paths or known hosts — never redirects to an arbitrary client-supplied URL
- [ ] User input that might contain `\r` or `\n` is rejected or stripped before ever reaching a header-setting call

## 8. Sessions, cookies & hijacking protection
- [ ] Session/auth tokens are stored in `httpOnly` cookies only — never in `localStorage`, `sessionStorage`, or a non-httpOnly cookie
- [ ] Cookies carry `Secure` (HTTPS only) and an explicit `SameSite`
- [ ] Session tokens are signed and verified server-side (tampering is rejected, not silently trusted)
- [ ] Sessions have a reasonable expiry and are rotated on login, password change, or privilege/role change
- [ ] Logout invalidates the session server-side (not just clears the client cookie) if sessions are tracked server-side; if using stateless JWTs, short expiry + refresh rotation substitutes for this
- [ ] Nothing sensitive (roles, permissions, other users' data) is embedded in a client-readable (non-httpOnly) cookie or JWT payload that the client is expected to trust without server re-verification

## 9. Error handling & information leakage
- [ ] Client-facing error responses are generic (`"Invalid request"`, `"Something went wrong"`) — no stack traces, raw DB error messages, internal file paths, or query text
- [ ] The real error is logged server-side with enough detail to debug
- [ ] Errors don't leak whether a resource exists to unauthorized users where that itself is sensitive (e.g. "user not found" vs "wrong password" can be worth unifying into "invalid credentials" for auth routes)

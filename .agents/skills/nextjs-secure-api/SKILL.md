---
name: nextjs-secure-api
description: Hardens Next.js API routes (App Router route handlers and pages/api) against XSS, SQL injection, CSRF/request hijacking, header injection, and cookie/session hijacking, and enforces rate limiting plus input sanitization on every endpoint. Use this skill whenever writing, reviewing, or debugging a Next.js API route, server action, or any backend endpoint that accepts user input, touches a database, or issues/reads auth sessions — even if the user doesn't say "security" explicitly. Trigger on things like "add an API route for login", "create an endpoint that queries the database", "handle this form submission on the backend", "set up user sessions/auth", "add a comment/upload/search endpoint", or "review this route handler" for a Next.js project.
---

# Secure Next.js API Routes

## Why this matters

Every new API route is a fresh attack surface — the fact that other parts of the app are "secure" doesn't protect a route that skips validation, builds a SQL string by concatenation, or stashes a session token in `localStorage`. Next.js route handlers run as stateless serverless functions, which breaks some intuitions people carry over from traditional servers (no in-process memory to rely on for rate limiting, no built-in CSRF middleware, no session store unless you add one). This skill exists so those gaps get closed by default on every endpoint, not just remembered once and forgotten on the next one.

## Workflow

1. **Identify what the endpoint actually does**: does it read or write data, does it accept a request body/query params, does it change state (POST/PUT/PATCH/DELETE), does it touch auth/session cookies? This determines which mitigations below are relevant — not every endpoint needs every one (a public GET that reads static content doesn't need CSRF protection, but it still needs rate limiting and headers).
2. Walk `references/checklist.md` for the endpoint being built or reviewed. It's organized by concern so you can skip sections that don't apply and say why.
3. For each applicable item, use the matching pattern in `references/code-patterns.md` rather than improvising — these are the vetted shapes for this codebase's stack (Next.js + typically MySQL/Prisma per this project's conventions).
4. If the project doesn't already have shared infrastructure for a concern, copy the relevant helper from `assets/` in rather than writing it inline per-route:
   - `assets/middleware.ts` — security headers + Origin/Referer verification on mutating requests, applied globally
   - `assets/rateLimiter.ts` — shared rate limiter (Redis-backed with an in-memory dev fallback)
   - `assets/session.ts` — signed, httpOnly cookie session issuing/reading/destroying (no client-side storage)
   Adapt names, import paths, and env var names to match the project's existing conventions instead of dropping them in verbatim.
5. Before considering the endpoint done, state explicitly which checklist items were applied and which were judged not applicable and why. Don't silently skip items — a one-line "no interpolated headers here, N/A" is enough, but it should be said.

## Core principles

Each of these is a *why*, not just a rule — apply judgment about what a specific endpoint needs.

**Input validation & sanitization** — Never trust anything from `req.body`, query params, headers, or cookies. Validate shape and type at the boundary (schema validation, e.g. zod) before any of that data reaches business logic, a query, or a response. Reject on failure rather than trying to "clean up" malformed input — sanitization is for content you intentionally allow through (like rich text), not a substitute for validation.

**SQL injection** — The only acceptable way to put a value into a query is a parameterized placeholder (`?` / `$1` / an ORM's typed query builder). String concatenation or template-literal interpolation into SQL is never safe, including for things that feel like "just an ID" or "just a sort column" — those need allow-listing, not escaping.

**XSS** — JSX auto-escapes interpolated values, which covers most React rendering, but that protection doesn't extend to `dangerouslySetInnerHTML`, HTML emails, markdown-to-HTML rendering, or raw HTML returned from an API and rendered elsewhere. Anywhere HTML is built from user input, sanitize server-side (e.g. DOMPurify with a JSDOM window) before storage or output, and set a Content-Security-Policy as a second layer of defense in case a sanitizer gap is missed.

**Rate limiting** — Serverless functions don't share memory between invocations, so an in-process counter silently stops working the moment there's more than one instance. Rate limiting needs a shared store (Redis is the standard choice) keyed by IP + route, with stricter limits on sensitive routes (login, password reset, signup) than general reads.

**CSRF / request hijacking** — Next.js doesn't ship CSRF tokens out of the box. The practical defense for state-changing routes (POST/PUT/PATCH/DELETE) is `SameSite=Lax` or `Strict` cookies plus explicit `Origin`/`Referer` header verification against an allow-list — reject the request if neither header is present and expected, rather than assuming their absence is fine.

**Security headers** — Set these on every response, not just HTML pages: `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` (or `frame-ancestors` in CSP), `Referrer-Policy`, `Permissions-Policy`, and `Strict-Transport-Security` in production. Apply them centrally in `middleware.ts` so a new route can't accidentally ship without them.

**Header/response injection** — Never write raw user input into a response header or a redirect `Location` without validating it first (CR/LF characters can split a header into two, injecting arbitrary headers or a fake response). Validate redirect targets against an allow-list of internal paths or known hosts rather than redirecting to whatever the client supplied.

**Sessions & cookies — no client-side storage** — Auth tokens/session identifiers belong in `httpOnly` cookies, never in `localStorage` or `sessionStorage`. Client-readable storage is directly readable by any injected script, which turns a single XSS bug into full session theft; an `httpOnly` cookie is invisible to JavaScript entirely. Cookies should also carry `Secure` (HTTPS-only) and an appropriate `SameSite`.

**Cookie/session hijacking hardening** — Beyond `httpOnly`/`Secure`/`SameSite`: keep session lifetimes short with rotation on privilege changes (e.g. re-issue the session on login, password change, or role change), invalidate server-side on logout rather than only clearing the client cookie, and sign/verify tokens (e.g. JWT with `jose`) so a tampered cookie is rejected rather than trusted.

**Error handling** — Return generic error messages and status codes to the client (`"Invalid request"`, `500`); log the real error (stack trace, query, params) server-side only. Leaking DB errors, stack traces, or internal paths in a response gives an attacker a map of the backend.

## Bundled resources

- `references/checklist.md` — the per-endpoint checklist, organized by concern, to run through for every route
- `references/code-patterns.md` — concrete Next.js/TypeScript code for each concern above (validation, parameterized queries, sanitization, rate limiting, origin checks, headers, redirects, sessions, error handling)
- `assets/middleware.ts` — drop-in Next.js middleware applying security headers globally and verifying request origin on mutating methods
- `assets/rateLimiter.ts` — drop-in rate limiter (Upstash Redis primary, in-memory fallback clearly marked dev-only)
- `assets/session.ts` — drop-in helpers for issuing, reading, rotating, and destroying signed httpOnly session cookies

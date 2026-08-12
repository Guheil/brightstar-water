---
name: backend-security-review
description: Reviews and hardens Next.js API route handlers (app/api/**/route.ts and pages/api/**/*.ts) against real-world attacks — missing auth/authorization, IDOR, SQL/NoSQL injection, XSS, CSRF, mass assignment, insecure CORS, missing security headers, secret exposure, and endpoints with no rate limiting. Produces a severity-ranked findings report AND applies fixes directly — per-endpoint rate limiting, input validation/sanitization, and injection/XSS-safe patterns. Use this whenever the user asks to secure, harden, audit, or pen-test a backend or API, wants their endpoints "production-ready," or mentions rate limiting, sanitizing input, preventing XSS/injection, or making a project secure — even if they don't use the words "security review."
---

# Backend Security Review (Next.js API Routes)

## Why this matters

Most API vulnerabilities aren't exotic — they're an endpoint that forgot to check who's asking, a database query built by gluing strings together, or a form field that gets stored and later rendered as raw HTML. This skill exists to catch that whole category systematically, endpoint by endpoint, rather than fixing whichever bug happens to be visible. Treat every route handler as hostile-input-facing until proven otherwise: assume the request body, query params, headers, and cookies are all attacker-controlled, because on the public internet they are.

## Process

Work through these phases in order. Don't skip the inventory step even if the user only mentions "the login endpoint" — a review that's scoped too narrowly misses the sibling endpoint nobody thought to check.

### 1. Inventory every endpoint

Run the scanner to enumerate route handlers and get a first pass of heuristic findings:

```bash
python3 scripts/scan_endpoints.py <project-root>
```

This finds every `app/api/**/route.{ts,tsx,js,jsx}` and `pages/api/**/*.{ts,tsx,js,jsx}` file, lists the exported HTTP methods in each, and flags textual patterns worth a closer look (no visible auth check, string-built SQL, `req.body` spread into a DB write, `dangerouslySetInnerHTML`, permissive CORS, no rate-limit call, etc.).

**Treat the scanner's output as a lead list, not a verdict.** It's regex-based — it will miss things wrapped in helper functions and will occasionally flag safe code. Every flagged line still needs your own reading of the surrounding logic, and every *unflagged* endpoint still needs a pass against the checklist below, since the scanner only catches the patterns it knows to look for.

### 2. Review each endpoint against the checklist

Read `references/vulnerability-checklist.md` and walk every endpoint through it. The checklist covers auth/authorization (including IDOR), injection (SQL/NoSQL/command), XSS, mass assignment, CSRF, CORS, security headers, secrets exposure, error handling, file uploads, SSRF, session/JWT handling, HTTP method enforcement, prototype pollution, and sensitive-data logging — with Next.js-specific before/after examples for each.

For each endpoint, reason concretely about:
- **Who can call this, and what do they need to prove?** (authentication) Then: **can they only affect their own data, or anyone's?** (authorization/IDOR) — these are two separate checks; an endpoint can require login and still let any logged-in user edit someone else's record.
- **Where does user input end up?** Trace every field from `req` into a query, a shell command, a file path, an HTML sink, or a response — that's where injection/XSS live.
- **What happens if this is called 1,000 times in a second?** — that's the rate-limiting question.

### 3. Write the findings report

Use this structure for the report — always lead with severity, since that's what determines what gets fixed first:

```markdown
# Security Review: <project/area name>

## Summary
<1-3 sentences: how many endpoints reviewed, how many findings by severity>

## Findings

### 🔴 Critical
**[Category] <short title>** — `path/to/route.ts:<line>`
<What's wrong, and the concrete way it's exploitable — not just "missing validation" but "an authenticated user can pass `{"$ne": null}` as the email filter and match every user in the database.">
Fix: <what you changed, or what needs a human decision>

### 🟠 High
...
### 🟡 Medium
...
### 🟢 Low
...

## Applied fixes
<List of files changed and what was added — rate limiting, validation schemas, sanitization, query fixes>

## Needs your decision
<Anything that requires business-logic knowledge you don't have: who *should* be able to access a resource, whether an endpoint is meant to be public, what rate limit is appropriate for a paid vs free tier, etc. Don't guess at business rules — flag them instead.>
```

Severity guide: **Critical** = unauthenticated data breach, full injection, auth bypass. **High** = authenticated IDOR, stored XSS, missing rate limit on auth/expensive endpoints. **Medium** = missing security headers, permissive CORS, verbose error disclosure. **Low** = defense-in-depth / hardening suggestions.

### 4. Apply fixes

- **Rate limiting** — read `references/rate-limiting.md` and add per-endpoint limits sized to what each endpoint does (auth endpoints strict, public reads lenient, expensive operations strict). Don't apply one blanket limit to every route.
- **Validation & sanitization** — read `references/sanitization-validation.md` and add a schema (zod or equivalent) per endpoint that parses and rejects unexpected input before any business logic runs. Fix injection at the source: parameterized queries, sanitized Mongo filters, no raw string-built SQL.
- **XSS** — sanitize on write (before storing rich text) and be suspicious of any `dangerouslySetInnerHTML`; prefer removing it over sanitizing around it.
- Fix issues in place rather than bolting on a wrapper that changes the endpoint's behavior or response shape — the goal is a secure version of the same API, not a different one.

### 5. Summarize

Tell the user what changed, in the "Applied fixes" section of the report, and be explicit about anything in "Needs your decision" — don't silently guess at authorization rules (e.g., who counts as an "admin," whether a resource is meant to be shared). Getting that wrong either breaks legitimate access or ships a false sense of security.

## Boundaries

- Don't invent an authentication system where none exists — flag it as a Critical finding and ask how the user wants to handle it (NextAuth/Auth.js, a custom JWT scheme, etc.) rather than picking one unprompted.
- Don't remove features to make an endpoint "safer" (e.g., don't strip a legitimate bulk-update capability instead of fixing its authorization check).
- Don't paste secrets you find into the report or into new code — if you find a hardcoded credential, flag its location and tell the user to rotate it; don't reproduce the value.
- If the codebase uses a stack outside Next.js API routes (e.g., a separate Express server, WordPress REST endpoints), the same checklist categories still apply, but the code-level examples in the references are Next.js-specific — adapt the pattern rather than pasting Next.js code into a different framework.

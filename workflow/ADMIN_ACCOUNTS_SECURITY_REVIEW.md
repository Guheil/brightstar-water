# Security Review: Admin Accounts and Live Customers

## Summary

Reviewed the two new privileged mutation endpoints and the server-side Admin data reads. Both mutation routes require an active Supabase Admin session, same-origin requests, JSON input, bounded request bodies, strict Zod schemas, a Supabase/Postgres-backed rate limiter, and generic client-facing errors.

## Findings

### Critical

None found after hardening.

### High

None found after hardening.

### Medium

None left open in the new endpoints.

### Low / informational

- Supabase may report RLS-enabled internal tables with no public policies. `admin_account_audit`, `admin_api_rate_limits`, and `legal_acceptances` are intentionally inaccessible to normal browser roles.
- Supabase Free may report leaked-password protection as disabled. This is a project-tier capability rather than an application-code bypass.
- Newly created indexes can initially appear as unused until real query traffic exercises them.

## Applied fixes

- Server-only Supabase privileged client.
- Active Admin authorization before privileged client creation.
- Strict role allow-list: `customer`, `deliverer`, `admin`.
- Strict input schemas with unknown-field rejection.
- Plain-text name validation and Philippine phone validation.
- Same-origin mutation checks.
- Content-Type checks.
- 16 KiB request-body cap enforced against both `Content-Length` and the actual body bytes.
- Per-Admin rate limits stored in Supabase/Postgres.
- Auth-user cleanup if application-profile provisioning fails.
- Append-only Admin account audit records.
- RLS-controlled Admin reads for live profiles.
- Bounded 25-row pagination.
- Trigram search indexes for name, email, and phone plus ordered/predicate indexes already used by profiles.
- Customer detail no longer displays mock order, address, or loyalty data as if it belonged to a real Supabase Customer.

## Endpoint inventory

### `POST /api/admin/accounts`

Creates an auto-confirmed Supabase Auth user and corresponding application profile. Only an active Admin may call it.

### `PATCH /api/admin/customers/[id]`

Updates only a Customer's display name, phone, and active/inactive state. It does not accept role or email fields, preventing mass assignment or privilege changes through this endpoint.

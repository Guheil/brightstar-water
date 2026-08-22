# MRJE Activity History Security Review

Date: August 22, 2026
Scope: All six Next.js API route files, the new Activity History read layer, current account/onboarding mutation flows, and `202608220005_activity_audit_ledger.sql`.

## Outcome

No confirmed Critical or High-severity vulnerability was found in the reviewed Activity History implementation after the fixes in this change set.

The project skill scanner reported heuristic authentication warnings on all six route files and sensitive-log warnings in the onboarding password route. Manual review determined those findings are false positives:

- Every route resolves the Supabase-authenticated profile before protected work.
- Admin account and Activity History routes require `role = admin`, `status = active`, and completed onboarding.
- Onboarding routes require an authenticated active profile in the exact onboarding stage expected by the endpoint.
- Password-related console entries contain only error code/status/user ID or an audit failure code. Password values, OTPs, tokens, cookies, and authorization headers are never logged.

## Security Controls Implemented

### Authorization and exposure

- The business ledger is `private.audit_events`, not a browser-facing table.
- `public`, `anon`, and `authenticated` have no table privileges on the ledger.
- Read RPCs are executable only by `service_role` and are called from protected Next.js server routes.
- `SECURITY DEFINER` functions use `set search_path = ''` and fully qualified application objects.
- The internal audit writer is not executable by browser roles or `service_role`; only the tightly scoped definer functions can call it.

### Audit integrity

- Audit rows are append-only. A database trigger blocks `UPDATE` and `DELETE`.
- Existing `admin_account_audit` rows are backfilled once with a partial unique legacy key.
- Current account/onboarding RPCs write the business mutation and its success audit event in the same PostgreSQL transaction.
- Cross-service account deletion uses one request/correlation UUID through reservation, restoration/failure, and final deletion events.
- The final deletion event is retried once after Auth deletion because the deleted profile can no longer be used to reconstruct the event.

### Privacy and secret handling

- Passwords, temporary passwords, OTPs, access/refresh tokens, session cookies, service credentials, authorization headers, and raw request bodies are never stored in Activity History.
- Phone-number changes are masked before/after values.
- Structured `changes` and `details` payloads are bounded to 16 KB each.
- User-agent data is stripped of control characters and bounded to 500 characters.
- Client IP is validated as an IP address and appears only in the Admin-only detail view.
- Human-readable summary/name/reason fields reject control characters and angle brackets at the database boundary.
- React renders all values as text. No `dangerouslySetInnerHTML` is used.

### Abuse and query controls

- Activity History list/detail endpoints use the existing database-backed rate limiter.
- List filters are strict Zod schemas. Unknown or duplicate query parameters are rejected.
- Search input is length-bounded and SQL wildcard characters are escaped before `ILIKE`.
- Result pages are bounded and use `(occurred_at, id)` keyset pagination instead of large `OFFSET` scans.
- Responses use `Cache-Control: private, no-store`.
- Existing global security headers remain in the project proxy/middleware path.

## Endpoint Review

| Endpoint | AuthN/AuthZ | Validation | Rate limit | Audit-specific note |
| --- | --- | --- | --- | --- |
| `POST /api/admin/accounts` | Active, fully onboarded Admin | Strict body schema and request limits | Yes | Success and meaningful creation failures are traced |
| `PATCH /api/admin/accounts/:id` | Active, fully onboarded Admin | UUID + strict body schema | Yes | Tracked field changes are transactional; no-op saves do not create noise |
| `DELETE /api/admin/accounts/:id` | Active, fully onboarded Admin + password verification | UUID + strict confirmation schema | Yes, stricter limit | Denied, started, restored, failed, and successful deletion outcomes share a trace ID |
| `POST /api/onboarding/password` | Active user at password-required stage | Strict password schema + request limits | Yes | Successful replacement and denied replacement are meaningful events; no password is logged |
| `POST /api/onboarding/profile` | Active user at profile-required stage | Strict profile/agreement schema | Yes | Completion and safe before/after profile changes are transactional |
| `GET /api/admin/activity-history` | Active, fully onboarded Admin | Strict bounded query schema | Yes | Service-only RPC, keyset pagination, no-store |
| `GET /api/admin/activity-history/:eventId` | Active, fully onboarded Admin | UUID only | Yes | Detail/security metadata loaded only on demand |

## Performance and Scalability Review

- Primary chronological index: `(occurred_at DESC, id DESC)`.
- Targeted indexes cover actor, category, result, and target history.
- Search uses the existing Supabase `pg_trgm` extension with an expression GIN index.
- List requests return lightweight fields only. JSON changes/details and security context are fetched only for one opened event.
- No-op account saves are intentionally not recorded, reducing write amplification and log noise.
- A synthetic keyset-order simulation covered 1,000,000 events and 20,000 pages without ordering gaps or duplicates.
- Partitioning and BRIN were intentionally not added yet because they would add operational complexity before measured volume requires them.

## Verification Performed

- Parsed all changed TS/TSX files with the installed TypeScript parser: passed.
- Audit/security source assertions: passed.
- New migration lexical sanity check: passed with 89 balanced top-level statements.
- Required audit object/invariant scan: passed.
- 1,000,000-event keyset pagination stress simulation: passed.
- Project backend-security scanner: completed; candidate findings manually reviewed as described above.

## Verification Limitation

The container cannot currently reach the npm registry (`EAI_AGAIN`), so the repository dependencies could not be installed and the project `vitest`, ESLint, and full `tsc --noEmit` commands could not be executed in this environment. Per the project skill, `npm run build` was not run. The Supabase migration was also not applied to a live project from this ZIP, so it still requires normal migration execution plus Supabase Database/Security Advisor checks in the target project before production deployment.

## Deployment Gate

Before production use:

1. Apply `202608220005_activity_audit_ledger.sql` through the project's normal Supabase migration workflow.
2. Verify the migration with representative account creation/update/onboarding/deletion actions.
3. Query Activity History as Admin and verify Customer/Deliverer/browser roles cannot access the private ledger/RPCs directly.
4. Run Supabase Database and Security Advisors and fix any new findings.
5. When dependencies are available, run `npm run typecheck`, `npm run lint`, and `npm test`. Do not substitute `npm run build` for these checks.

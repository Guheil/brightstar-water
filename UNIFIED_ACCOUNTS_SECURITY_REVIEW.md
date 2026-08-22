# Security Review: Unified Admin Accounts

## Summary

Reviewed the unified Admin account directory, generic account update endpoint, and permanent account deletion flow. The implementation keeps privileged Supabase Auth operations server-only, requires an active fully onboarded Administrator, re-authenticates destructive deletion with the current Administrator password, and enforces Administrator ownership plus last-active-Administrator protection in PostgreSQL.

## Findings

### Critical

No unresolved Critical finding was identified in the new account-management routes.

The endpoint scanner flags authentication heuristically because authentication is implemented through the imported `getAuthenticatedProfile()` helper rather than an inline token/session identifier. Manual review confirms both Admin account routes require an authenticated profile with `role = admin`, `status = active`, and `onboarding_stage = complete` before privileged operations run.

### High

No unresolved High finding was identified.

Permanent account deletion is protected against IDOR/role bypass by reloading the target on the server and by independently enforcing Administrator deletion rules inside `reserve_admin_account_deletion`. Another Administrator cannot delete a different Administrator account.

### Medium

No new unresolved Medium finding was identified.

Deletion spans PostgreSQL and Supabase Auth, which cannot be one atomic transaction. The mitigation uses a database reservation before Auth deletion, restores the reservation if Auth rejects deletion, and treats reservations older than ten minutes as stale so a crashed server cannot permanently strand an account.

### Low

The final `account_deleted` audit write occurs after Supabase Auth deletion. If that audit write alone fails, the user is already deleted. The route records a server-side error so the operational failure is visible, while the earlier `account_deletion_reserved` audit event remains as evidence that the deletion was initiated. This is accepted because restoring a successfully deleted Auth identity would be unsafe and cannot reconstruct the original password.

## Applied fixes

- Consolidated Customer, Deliverer, and Administrator identity management under `/admin/accounts`.
- Removed the separate Customers navigation entry and retained old Customer URLs only as redirects.
- Added generic account detail routing at `/admin/accounts/[id]`.
- Added strict Zod schemas for managed-account updates and deletion confirmation.
- Added same-origin mutation verification, JSON content-type checks, request-size limits, no-store responses, and per-Admin database-backed rate limiting.
- Added password re-authentication for every permanent deletion.
- Added typed email confirmation for Administrator self-deletion.
- Blocked editing privileged Administrator accounts from the shared account editor.
- Blocked deletion of another Administrator account on both the route and database layers.
- Blocked deletion of the last active, fully onboarded Administrator.
- Serialized Administrator self-deletion checks with a PostgreSQL advisory transaction lock to prevent a concurrent last-admin race.
- Added crash-safe deletion reservations with stale-reservation recovery.
- Preserved account state while deletion is reserved.
- Added account update, deletion reservation, restoration, and deletion audit actions.
- Kept the Supabase service credential server-only.

## Validation performed

- Database tests were executed inside transactions and rolled back; no production account was deleted.
- Customer deletion reservation and restoration passed.
- Stale reservation recovery passed.
- Last active Administrator self-deletion was rejected.
- No deletion reservations remained after rollback.
- TypeScript/TSX syntax parsing passed for all source files.
- Local import resolution scan found no missing local imports.
- New Admin surfaces contain no `sx`, inline `style`, or raw component color literals.

## Needs your decision

No additional business-rule decision is required for the approved scope. If the project later stores user-owned Supabase Storage objects for payment or delivery evidence, define a retention/reassignment policy before allowing those retained objects to be removed during account deletion.

## Deletion target lookup regression fix

A live deletion attempt exposed a permission-model mismatch: the DELETE route used the server-only Supabase Admin client for a direct `profiles` SELECT. The project intentionally grants that client only narrowly scoped database privileges, so PostgREST returned `403` even though the target account existed. The route then incorrectly collapsed both permission failures and genuine absence into `Account not found`.

The fix keeps the privileged client for rate limiting, protected deletion RPCs, and `auth.admin.deleteUser()`, but resolves the target through the existing authenticated Admin read path (`getManagedProfile`) protected by the Admin RLS policy. A genuine missing account still returns `404`; a database/read failure now returns a generic `500` without leaking the underlying database error. No broader `service_role` table grant was added.

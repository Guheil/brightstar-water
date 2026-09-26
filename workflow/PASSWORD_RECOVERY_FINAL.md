# Password recovery: final implementation guide

## Status and scope

This repository now has a server-authoritative Supabase PKCE password-recovery flow. It replaces the former simulated Forgot Password screen without changing normal sign-in, OTP verification, ordering, payments, inventory, delivery, or role authorization flows.

The migration in `supabase/migrations/20260926030628_password_recovery_security.sql` is intentionally **not applied** by this implementation. Apply it first in a reviewed development/staging environment, then through the project's normal production migration process.

## Required configuration

Set these server variables in each deployment environment. Do not expose either value with a `NEXT_PUBLIC_` prefix.

```dotenv
SUPABASE_SECRET_KEY=server_only_supabase_secret
PASSWORD_RECOVERY_INTENT_SECRET=a_unique_random_secret_of_at_least_32_characters
```

Keep the existing public settings:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
```

Generate `PASSWORD_RECOVERY_INTENT_SECRET` with a cryptographically secure secret manager. Rotating it invalidates outstanding recovery intents, which is safe; users will need a new recovery email.

In Supabase Auth URL Configuration, add the exact callback URL for every deployed origin:

```text
https://YOUR_DOMAIN/auth/recovery/callback
```

For local testing, add the matching local origin, for example `http://localhost:3000/auth/recovery/callback`. Do not add wildcard redirect URLs just to make recovery work.

Use a configured, deliverable SMTP provider before thesis/production deployment. Supabase's default email service is intentionally limited and is not a production mail-delivery solution.

## Recovery architecture

1. `/forgot-password` posts the normalized email to `/api/auth/password-recovery/request`.
2. The server validates same-origin JSON, limits the body to 1 KiB, consumes separate HMAC-keyed IP and email rate-limit buckets, and calls `resetPasswordForEmail` with a fixed callback origin. Every validly shaped request receives the same success response; it never queries profiles or reveals account existence.
3. The request creates a PKCE verifier in a **separate `mrje-recovery-auth` HttpOnly, SameSite=Lax cookie namespace**. It is not the standard browser-readable Supabase application session.
4. `/auth/recovery/callback` exchanges the code. With installed `@supabase/auth-js` 2.112.3, `resetPasswordForEmail` appends `/recovery` to the stored PKCE verifier and `exchangeCodeForSession` returns `redirectType: 'recovery'`. The callback requires that marker, verifies returned claims with `getClaims(access_token)`, and binds the verified `sub` and `session_id` to server state. A normal authenticated session cannot satisfy these checks.
5. The callback issues a separate signed recovery-intent cookie. It contains only HMACs of the verified user and session identifiers, expires in ten minutes, is HttpOnly, and has no token, password, raw email, or redirect target.
6. `/reset-password` and `/api/auth/password-recovery/complete` require the special recovery cookie, verified claims, an active registry entry, and a matching signed intent. Completion uses the authenticated recovery client to call `auth.updateUser({ password })`; it never uses the admin API to change a password.
7. Completion attempts global Supabase sign-out, then local sign-out, clears both recovery cookie namespaces and ordinary Supabase SSR cookies in this browser, and redirects to sign-in. If revocation partly fails after a successful password change, it reports success with a fresh-login notice rather than falsely reporting failure.

## Session containment

The application proxy recognizes the dedicated recovery cookie before examining ordinary application credentials. An active recovery session may use only:

- `/reset-password`
- `POST /api/auth/password-recovery/complete`

All other pages redirect back to reset and all other APIs receive `403`. The reset screen is outside the authenticated layout so ordinary dashboard redirects cannot hijack it. `AuthSessionSync` also suppresses client session hydration, cart synchronization, operational polling, and direct profile reads on this route.

The recovery-session registry is intentionally retained after the ten-minute intent expires. It is changed only after sign-out succeeds and remains restrictive until the verified access-token expiry; if session revocation cannot be verified, it remains `revocation_pending` and fails closed. The ten-minute lifetime controls authorization to set the password, not the release of the underlying session restriction.

## Database migration requirements

The existing `admin_api_rate_limits` structure was inspected and not reused: it has no expiry cleanup or cardinality ceiling and is scoped to administrative APIs. The new migration adds only the justified recovery controls:

- `password_recovery_rate_limits`: HMAC-only keys, bounded cleanup, serialized hard cap of 20,000 keys, and a service-role-only consume RPC.
- `password_recovery_sessions`: verified user/session IDs and state only, with a hard cap of 20,000 rows. Active and pending rows are never timer-deleted. Only globally signed-out rows whose access JWT has passed verified expiry are cleaned.

The migration grants direct registry access only to `service_role`; browser roles receive no table or function privileges. Do not apply it through the live dashboard without review. There is no migration rollback because these security tables contain no application records and no live database was changed here.

## Direct Supabase-access audit

The audit found the following production paths:

- Browser Supabase use is limited to login/registration/onboarding and `AuthSessionSync`; the latter is disabled on `/reset-password`.
- The ordinary direct browser Data API read is `profiles`; recovery credentials are in a different HttpOnly storage namespace and are unavailable to `createBrowserClient`, JavaScript, Data API, RPC, Realtime, or Storage requests.
- Operational database reads/writes and all exposed application RPC calls use protected Next routes and service-role server helpers. The proxy blocks those routes during recovery.
- No production Realtime channel/subscription is present.
- Product images are public catalog assets; payment, delivery-evidence, and GCash Storage access is server-side service-role/signed-URL only.

This separation is why a recovery session does not rely merely on Next route blocking: its Supabase bearer credential is not available to browser-side direct Supabase clients in the first place.

## Password policy

New and changed passwords now use the shared Zod policy: 15 to 72 characters, with no trimming, lowercasing, or transformation. It applies to public registration, managed-account creation, onboarding replacement, ordinary password change, and recovery completion. Existing passwords remain valid for login; no retroactive login restriction was added.

## Manual verification checklist

After applying the migration in a non-production environment:

1. Request recovery for a known and unknown email. Confirm identical success copy and no profile lookup/email leak.
2. Open a fresh recovery link in the same browser profile. Confirm callback reaches `/reset-password`; an expired, replayed, altered, or copied link returns to Forgot Password.
3. While on reset, try customer/admin/deliverer pages and representative `/api/customer`, `/api/admin`, and `/api/deliverer` requests. Confirm redirect/403 containment.
4. Confirm browser developer tools cannot see `mrje-recovery-auth` or the intent cookie through `document.cookie`.
5. Submit a 14-character password, a mismatched confirmation, then a valid 15+ character password. Confirm only the valid value succeeds.
6. Confirm the result clears recovery cookies, displays sign-in success feedback, and that the new password works while the old one does not.
7. Test a deliberately unavailable global sign-out path. Confirm the password change still succeeds, the recovery cookie is cleared, and a fresh login is required.
8. Check Supabase Auth Redirect URL and SMTP configuration on the actual deployment domain.

## Legacy cleanup

Removed after repository-wide reference checks:

- `src/services/local/`
- `src/screens/admin/customerPrototypeState.ts`
- `src/screens/admin/productPrototypeState.ts`

`src/screens/admin/customerState.ts` and `productState.ts` remain because repository tests still exercise them. `src/data/` and `src/mocks/` remain because they provide fixtures, geographic fallback data, and development/test support; they were not removed merely for their names.

## Remaining deployment considerations

- Supabase Auth password-strength settings may be configured in addition to the app's 15-character policy, but should not be set below it.
- The rate/session caps are intentional availability controls. Alert on cap exhaustion or recurring `revocation_pending` rows instead of silently enlarging them.
- Review proxy behavior after any future change to the project's Supabase SSR cookie architecture. The dedicated recovery cookie name and HttpOnly property are security boundaries.

# Authentication Phase 1 Security Review

## Scope

Phase 1 replaces the browser-side demo authentication path with Supabase Auth while keeping the rest of the thesis data prototype local for now.

Implemented production authentication boundary:

- Supabase email/password Auth
- Supabase email OTP confirmation
- Supabase SSR cookie/session handling
- `public.profiles` linked to `auth.users`
- customer/admin/deliverer role checks
- Row Level Security on profiles
- customer-only public signup
- Supabase logout
- protected Admin, Customer, and Deliverer server layouts
- security headers and no-store handling for authenticated workspaces

There are no custom Next.js authentication API endpoints in this phase. Login, signup, verification, resend, logout, session refresh, and Auth rate limiting are owned by Supabase.

## Trust boundaries

### Trusted

- verified Supabase JWT claims on the server
- `auth.users`
- PostgreSQL constraints and triggers
- `public.profiles.role` and `public.profiles.status`
- RLS policies and PostgreSQL grants

### Not trusted for authorization

- Zustand state
- URL parameters
- form fields
- `user_metadata.role`
- browser-controlled IDs
- client redirects

Zustand now mirrors the authenticated user only so the existing prototype screens continue to work. It is not an authorization boundary.

## Security controls

### Authentication

The login screen uses `signInWithPassword`. Public registration uses `signUp`. Email confirmation uses `verifyOtp`, and resend uses Supabase Auth resend. No password is checked against a local array in the production UI.

### Role escalation prevention

The signup trigger always inserts `role = customer`. It never consumes a role from user metadata. The migration explicitly revokes broad table privileges from `anon` and `authenticated`, then grants authenticated users only SELECT and UPDATE access to `full_name` and `phone`.

A user therefore cannot promote themselves by editing the request body, Zustand state, or their Supabase user metadata.

### IDOR and profile isolation

The profiles table enables RLS. The SELECT and UPDATE policies require `auth.uid() = profiles.id`. A normal authenticated account can only see or update its own profile row.

### Input validation and injection

Registration validates name, email, Philippine mobile number, and password client-side for UX. The database trigger independently normalizes and validates the required name and phone fields before the profile is inserted.

The application does not construct raw SQL from authentication inputs. Privileged profile fields are fixed by database logic.

### XSS

Authentication fields are plain text and rendered through React. The live auth path does not use `dangerouslySetInnerHTML`. Names containing angle brackets or control characters are rejected by the registration schema and database constraint/trigger.

A Content Security Policy and complementary browser security headers are applied in the Next.js Proxy. The CSP currently permits inline scripts/styles required by the existing Next.js/MUI rendering approach. It can be tightened further with nonce-based CSP if this thesis application later becomes a public commercial deployment.

### Sessions

The SSR implementation uses `@supabase/ssr`. Proxy calls `supabase.auth.getClaims()` immediately after client creation so the token is verified/refreshed before protected Server Components run. Protected layouts re-check the trusted profile role instead of trusting the client store.

Authenticated workspace responses receive `Cache-Control: private, no-store` to avoid shared caching of user-specific pages.

### Rate limiting

No custom in-memory limiter was added. Authentication requests go directly to Supabase Auth and use Supabase's built-in Auth rate limits. This avoids introducing an unreliable process-local limiter into a serverless Next.js deployment.

## Adversarial checks

| Attempt | Result |
|---|---|
| Change signup role to `admin` | Ignored. Trigger writes `customer`. |
| Update `profiles.role` through Data API | Blocked by column privileges. |
| Read another user's profile ID | Blocked by RLS. |
| Change Zustand role in DevTools | Does not pass server layout role check. |
| Use spoofed session cookie | Protected server code verifies JWT claims. |
| Submit `<script>` as full name | Rejected by app validation and DB validation. |
| Brute-force login through app | Subject to Supabase Auth rate limits. |
| Steal a frontend service-role key | No service-role/secret key is shipped by Phase 1. |
| Open Customer/Admin/Deliverer route while signed out | Redirected to login by server layout. |
| Open the wrong role workspace | Redirected to the authenticated role's workspace. |

## Deliberately deferred

These are not silently simulated in Phase 1:

- password recovery/change
- email change/re-verification
- admin account-management UI
- deliverer account-management UI
- MFA
- custom SMTP
- database migration of Orders, Inventory, Deliveries, Payments, and Loyalty

The old fake password-recovery route was removed from the live application rather than leaving a simulated security-sensitive flow beside real Supabase authentication.

## Free-tier considerations

Supabase's built-in Auth email sender is suitable for thesis/development volume but is intentionally limited. Use the setup checklist before a presentation, and configure SMTP later only if real registration volume requires it.

## Phase 1 conclusion

The authentication source of truth is now Supabase. The legacy local/mock password service and demo credential fixtures were removed. Supabase is the only authentication implementation in the project after Phase 1.

## Registration agreement hardening

- Account creation is no longer initiated from the password step. The live `signUp()` call is reached only from the agreement dialog action.
- Terms acceptance and Privacy Policy acknowledgment are separate controls and are not pre-checked.
- Both controls stay disabled until both legal documents have been scrolled to their end in the registration dialog.
- Supabase signup metadata includes the exact current legal versions, but user metadata is not treated as the permanent audit record.
- `public.legal_acceptances` has RLS enabled and grants no browser read/write privileges. The auth trigger writes the append-only registration record with `now()` so the client cannot forge the stored timestamp.
- The trigger rejects missing agreement flags or stale legal versions before creating the application profile and legal acceptance record.

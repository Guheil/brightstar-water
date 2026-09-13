# Account security review

## Decision

For this student thesis, the Administrator email is an email-shaped login identifier and may not correspond to a real inbox. Email ownership verification is therefore intentionally not required for the self-service login-email change.

## Assurance model

The login-email change requires all of the following:

- An authenticated application session.
- An active application profile allowed to access the system.
- A same-origin mutation request.
- Strict JSON content type and request-size enforcement.
- Strict Zod validation with no mass-assignment surface.
- Persistent per-account rate limiting.
- Successful re-verification of the current password against Supabase Auth.
- A server-only Supabase Admin credential for the final Auth mutation.

After success, the browser is signed out and local application auth state is cleared so the user signs in again with the new identifier.

## Privilege boundary

`auth.admin.updateUserById()` is used only because an email inbox may not exist. It is not callable from the browser. The server chooses the target user ID from the authenticated profile rather than accepting a target user ID from request input, preventing the route from becoming a general account-editing endpoint.

The mutation updates only:

- the signed-in user's email
- the email confirmation state required for password-based login

No role, status, metadata, or other user's credentials can be supplied by the request body.

## Direct-client bypass protection

Normal Supabase client-side email changes remain protected with `double_confirm_changes = true`. Therefore a user cannot reproduce the immediate thesis login-email change directly from browser DevTools. The no-inbox-confirmation behavior exists only behind the server route's current-password check.

## Password handling

Passwords are sent only to the required Auth operation over the authenticated request path. They are not persisted by the application, added to logs, stored in Zustand, written to `public.profiles`, or returned in responses.

## Known thesis tradeoff

A fake email means email-based password recovery cannot work. For the thesis demo, recovery can be handled administratively in Supabase if necessary. Security questions were intentionally not added because they would create a weaker custom recovery mechanism.

For a production deployment, migrate Administrator accounts to real controlled inboxes and use normal verified-email recovery. MFA can be added if the risk model requires it.

## Database consistency

`auth.users.email` remains the credential source of truth. The migration `202609120001_account_security_email_sync.sql` synchronizes the resulting Auth email into `public.profiles.email` after an Auth update.

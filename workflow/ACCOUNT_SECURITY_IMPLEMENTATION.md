# Account security implementation

## Scope

The Administrator account screen supports two self-service credential changes:

- Change the login email after re-verifying the current password.
- Change the password after supplying the current password.

This is intentionally scoped for a student thesis. The login email is treated as an email-shaped sign-in identifier and does not need to be backed by a real inbox.

## Login email change

The browser sends only `newEmail` and `currentPassword` to the protected same-origin Account API.

The server then:

1. Confirms there is a valid signed-in application profile.
2. Applies request size, JSON, same-origin, strict schema, and persistent rate-limit controls.
3. Re-verifies the current password against Supabase Auth using the account's existing login email.
4. Uses the server-only Supabase Admin client to update only that signed-in user's email and mark it confirmed.
5. Relies on the Auth-to-profile database trigger to synchronize `public.profiles.email`.
6. Returns success and the browser clears its local session, signs out, and redirects to `/login`.

The Supabase secret/service-role credential is never exposed to browser code.

## Why no email confirmation

The thesis may use placeholder or non-deliverable email addresses for Administrator accounts. Requiring an inbox would make legitimate demo accounts impossible to update.

The current password is therefore the re-authentication factor for changing the login identifier. This is weaker than proving inbox ownership and is intentionally documented as a thesis-only tradeoff, not a recommended production account-recovery design.

Normal client-side Supabase email changes remain strict with:

```toml
[auth.email]
double_confirm_changes = true
secure_password_change = true
```

The immediate no-email-confirmation path exists only in the protected server route after current-password verification.

## Password change

Password changes remain self-service and require the current password plus a new password and confirmation. Passwords are never stored in the application's profile table, local storage, Zustand state, audit payloads, or logs.

## Required database migration

Apply:

`supabase/migrations/202609120001_account_security_email_sync.sql`

This keeps `public.profiles.email` synchronized whenever the source-of-truth Auth email changes.

## Manual test checklist

1. Sign in as an Administrator and open `/admin/account`.
2. Open Accounts and confirm `My login & security` opens `/admin/account`.
3. Try changing the login email with the wrong current password. It must fail.
4. Try the current login email as the new value. It must be rejected.
5. Try an invalid email-shaped value. Validation must reject it.
6. Enter the correct password and a different email-shaped login such as `admin@example.com`.
7. The email should change immediately without sending a confirmation message.
8. The browser should return to the login screen with a success notice.
9. Sign in using the new login email and the existing password.
10. Confirm the Account page and Accounts directory both display the new login email.
11. Confirm a duplicate login email is rejected.
12. Confirm password changes still require the current password.

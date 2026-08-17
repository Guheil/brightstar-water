# Supabase Authentication Phase 1 Setup

This project now uses Supabase as the only production authentication backend. The previous browser-side demo login and locally generated registration OTP are no longer used by the application UI.

## 1. Create the Supabase project

Use a Supabase Free project. In **Project Settings > API**, copy:

- Project URL
- Publishable key

Create `.env.local` from `.env.example` and fill in only:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
```

Do not add a secret key or `service_role` key to browser environment variables. Phase 1 does not require one.

## 2. Install dependencies

```bash
npm install
```

The project now depends on `@supabase/supabase-js` and `@supabase/ssr`.

## 3. Apply the database migration

Open **Supabase Dashboard > SQL Editor** and run:

`supabase/migrations/202608170001_auth_phase1.sql`

The migration creates:

- `public.user_role`
- `public.profile_status`
- `public.profiles`
- profile indexes
- Row Level Security policies
- a signup trigger linked to `auth.users`
- an updated-at trigger

Public registration always writes `role = customer`. The role and account status cannot be changed by a normal authenticated user through the Data API.

## 4. Configure email/password authentication

In **Authentication > Sign In / Providers > Email**:

- Keep Email enabled.
- Keep **Confirm email** enabled.
- Set the minimum password length to at least 8 for this thesis project.

## 5. Enforce a six-digit email OTP

In the hosted Supabase Dashboard, open **Authentication → Sign In / Providers → Auth Providers → Email** and set the **Email OTP length** to `6`. Keep the email OTP expiration at a reasonable value such as `3600` seconds or lower.

The repository also mirrors this requirement in `supabase/config.toml` with `auth.email.otp_length = 6` for local/CLI-managed Supabase environments. The local config does not automatically change an already-hosted Supabase project, so the Dashboard value must match.

Supabase supports email OTP lengths from 6 to 10 digits and documents 6 as the default.

## 6. Make Confirm signup send the six-digit code

The registration screen expects the six-digit Supabase email token.

Open **Authentication > Email Templates > Confirm signup** and use a template that includes `{{ .Token }}`. For example:

```html
<h2>Verify your MRJE + Bright Star account</h2>
<p>Enter this verification code in the registration screen:</p>
<p><strong>{{ .Token }}</strong></p>
<p>If you did not create this account, you can ignore this email.</p>
```

Do not display the token inside the application. Supabase sends it by email and the app verifies it with `supabase.auth.verifyOtp()`.

## 7. URL configuration

In **Authentication > URL Configuration** set the Site URL for the environment you are testing, for example:

```text
http://localhost:3000
```

Add the deployed thesis URL before deployment.

The current Phase 1 OTP flow does not depend on a confirmation redirect, but correct Site URL configuration is still important for later recovery/change-email flows.

## 8. Create Admin and Deliverer thesis accounts

The public `/register` flow intentionally creates only Customers.

For thesis/demo Admin and Deliverer accounts:

1. Log out of any existing account, then register the account once through the normal `/register` screen so the required name, phone, email verification, and profile trigger all run exactly like a real account.
2. In the Supabase SQL editor, promote only the intended verified account.

```sql
update public.profiles
set role = 'admin'
where email = 'your-admin-email@example.com';
```

or:

```sql
update public.profiles
set role = 'deliverer'
where email = 'your-deliverer-email@example.com';
```

3. Sign out and sign back in after promotion so the UI session cache immediately reflects the new role.

Do not add a role selector to public registration.

## 9. Free-tier note

Supabase's built-in Auth email provider is intentionally rate limited and is suitable for development/thesis demonstrations, not high-volume public email delivery. If registration email volume becomes a real requirement later, configure SMTP in Supabase rather than changing the authentication architecture.

## 10. Verification checklist

- Register a new Customer.
- Confirm the email contains a six-digit token.
- Enter a wrong token and confirm registration is rejected.
- Enter the correct token and confirm `/customer/account` opens.
- Log out and verify the Supabase session is cleared on that browser.
- Log in again with email/password.
- Attempt `/admin/overview` as a Customer and confirm the server redirects away.
- Promote a test account to Admin and confirm `/admin/overview` works.
- Attempt `/customer/account` as the Admin and confirm the server redirects to the Admin workspace.
- Repeat for Deliverer.

## Registration Terms and Privacy Agreement (Phase 1 extension)

If you already applied `202608170001_auth_phase1.sql`, also run:

```text
supabase/migrations/202608170002_registration_legal_agreement.sql
```

The second migration adds an append-only `legal_acceptances` table and replaces the existing new-user trigger so public registration must include the current Terms of Use and Privacy Policy versions before the customer profile is created.

The current versions are defined in `src/config/legal.ts` and must stay aligned with the exact version checks in the migration. When either document changes, create a new migration and increment the matching application constant rather than editing a historical acceptance record.

The browser does not provide the acceptance timestamp. PostgreSQL records `accepted_at` with `now()` inside the trusted signup trigger. Authenticated and anonymous API roles have no direct write privileges on `legal_acceptances`.

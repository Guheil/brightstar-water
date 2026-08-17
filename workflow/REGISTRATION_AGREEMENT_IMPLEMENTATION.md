# Registration Agreement Implementation

## Flow

The registration sequence is now:

1. Customer details
2. Password
3. Terms and Privacy review
4. Supabase account creation
5. Six-digit email verification

`supabase.auth.signUp()` is not called from the password step. It is called only after the user reaches the end of both legal documents, accepts the Terms of Use, and acknowledges the Privacy Policy in the registration dialog.

## Legal versions

The active versions live in `src/config/legal.ts`:

- Terms of Use: `1.0`
- Privacy Policy: `1.0`

The matching database checks live in `supabase/migrations/202608170002_registration_legal_agreement.sql`.

## Supabase audit record

The second migration creates `public.legal_acceptances`. Anonymous and authenticated browser roles receive no direct privileges on the table. The `auth.users` signup trigger validates the current versions and affirmative agreement metadata, creates the customer profile, and writes the legal acceptance using the database timestamp.

## Important limitation

The UI can require the user to scroll through each document before the checkboxes become enabled. No web application can prove that a person understood every sentence, and a custom client could imitate the final signup request. The database record therefore proves the recorded agreement and document versions, not human comprehension.

## Legal review

The included Terms of Use and Privacy Policy are project-specific thesis drafts. Replace or review them with the business/adviser/privacy contact before a real public commercial launch, especially any business contact, retention, cancellation, refund, and operational language that becomes more specific later.

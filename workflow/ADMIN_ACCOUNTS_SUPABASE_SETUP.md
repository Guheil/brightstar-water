# Admin Accounts Supabase Setup

The Admin Accounts feature is Supabase-only. It uses the signed-in Supabase session for authorization and a server-only Supabase admin credential only when creating Auth users.

## Required server environment value

Add one of these to your existing `.env.local` file. Do not prefix it with `NEXT_PUBLIC_`.

Preferred when your Supabase project exposes the newer secret key:

```env
SUPABASE_SECRET_KEY=your_server_only_supabase_secret
```

Legacy alternative:

```env
SUPABASE_SERVICE_ROLE_KEY=your_server_only_service_role_key
```

Use only one. Never paste either value into client components, browser code, Git, screenshots, or documentation committed to the repository.

The existing public values remain unchanged:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

## Database migrations

The connected project already received the migrations used by this implementation. For another Supabase project, apply the SQL files in `supabase/migrations` in order.

The account-management migrations add:

- role-aware phone constraints
- active-Admin profile read access through RLS
- searchable profile indexes
- an append-only Admin account audit table
- a small Supabase/Postgres-backed Admin API rate limiter
- guarded profile-provisioning and Customer-update RPCs

## Account behavior

Public `/register` remains Customer-only and still requires the current Terms and Privacy flow.

Admin-created accounts can be Customer, Deliverer, or Admin. They are created through Supabase Auth using a server-only Admin API call. Admin-created Customer accounts require a Philippine mobile number. Admin and Deliverer accounts may temporarily have a blank phone number.

## Security boundary

The browser never receives the Supabase secret/service-role credential. Every privileged mutation first checks the current Supabase session and confirms that the caller has an active `admin` profile before the privileged client is created.

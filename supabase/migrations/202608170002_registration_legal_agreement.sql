-- Registration legal agreement audit for MRJE Gas + Bright Star Water.
-- Apply after 202608170001_auth_phase1.sql.

create table public.legal_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  terms_version text not null,
  privacy_version text not null,
  accepted_at timestamptz not null default now(),
  source text not null default 'customer_registration',
  constraint legal_acceptances_terms_version_length check (char_length(terms_version) between 1 and 32),
  constraint legal_acceptances_privacy_version_length check (char_length(privacy_version) between 1 and 32),
  constraint legal_acceptances_source check (source = 'customer_registration'),
  constraint legal_acceptances_version_pair_unique unique (user_id, terms_version, privacy_version)
);

alter table public.legal_acceptances enable row level security;

-- The browser must not be able to insert, update, or delete its own legal
-- acceptance record. The security-definer auth trigger below is the only
-- registration write path for this table.
revoke all privileges on table public.legal_acceptances from anon, authenticated;

comment on table public.legal_acceptances is
  'Append-only registration agreement record written by the auth.users signup trigger. No browser write privileges are granted.';
comment on column public.legal_acceptances.accepted_at is
  'Trusted database timestamp. The client does not provide or control this value.';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  normalized_name text;
  normalized_phone text;
  submitted_terms_version text;
  submitted_privacy_version text;
  terms_accepted boolean;
  privacy_acknowledged boolean;
begin
  normalized_name := btrim(coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  normalized_phone := regexp_replace(coalesce(new.raw_user_meta_data ->> 'phone', ''), '[^0-9]', '', 'g');
  submitted_terms_version := btrim(coalesce(new.raw_user_meta_data ->> 'terms_version', ''));
  submitted_privacy_version := btrim(coalesce(new.raw_user_meta_data ->> 'privacy_version', ''));
  terms_accepted := lower(coalesce(new.raw_user_meta_data ->> 'terms_accepted', 'false')) = 'true';
  privacy_acknowledged := lower(coalesce(new.raw_user_meta_data ->> 'privacy_acknowledged', 'false')) = 'true';

  if char_length(normalized_name) < 2
     or char_length(normalized_name) > 60
     or normalized_name ~ '[<>[:cntrl:]]' then
    raise exception 'Invalid registration profile data';
  end if;

  if normalized_phone !~ '^09[0-9]{9}$' then
    raise exception 'Invalid registration profile data';
  end if;

  -- Keep these exact values aligned with src/config/legal.ts. A public signup
  -- using an old or missing legal version is rejected rather than silently
  -- recording an agreement to a different document.
  if not terms_accepted
     or not privacy_acknowledged
     or submitted_terms_version <> '1.0'
     or submitted_privacy_version <> '1.0' then
    raise exception 'Current registration agreement is required';
  end if;

  insert into public.profiles (id, email, full_name, phone, role, status)
  values (
    new.id,
    lower(btrim(coalesce(new.email, ''))),
    normalized_name,
    normalized_phone,
    'customer'::public.user_role,
    'active'::public.profile_status
  );

  insert into public.legal_acceptances (
    user_id,
    terms_version,
    privacy_version,
    accepted_at,
    source
  )
  values (
    new.id,
    submitted_terms_version,
    submitted_privacy_version,
    now(),
    'customer_registration'
  );

  return new;
end;
$$;

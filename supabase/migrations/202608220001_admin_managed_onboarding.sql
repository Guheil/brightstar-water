-- First-login onboarding for accounts provisioned by an Administrator.
-- Existing accounts remain fully active. New Admin-managed accounts must
-- replace the temporary password and complete their profile before app access.

create type public.account_origin as enum ('self_registered', 'admin_managed');
create type public.onboarding_stage as enum ('password_required', 'profile_required', 'complete');

alter table public.profiles
  add column account_origin public.account_origin not null default 'self_registered'::public.account_origin,
  add column onboarding_stage public.onboarding_stage not null default 'complete'::public.onboarding_stage,
  add column onboarding_password_changed_at timestamptz,
  add column onboarding_completed_at timestamptz;

alter table public.profiles
  add constraint profiles_onboarding_state_consistency check (
    (
      account_origin = 'self_registered'::public.account_origin
      and onboarding_stage = 'complete'::public.onboarding_stage
      and onboarding_completed_at is not null
    )
    or
    (
      account_origin = 'admin_managed'::public.account_origin
      and (
        (
          onboarding_stage = 'password_required'::public.onboarding_stage
          and onboarding_password_changed_at is null
          and onboarding_completed_at is null
        )
        or
        (
          onboarding_stage = 'profile_required'::public.onboarding_stage
          and onboarding_password_changed_at is not null
          and onboarding_completed_at is null
        )
        or
        (
          onboarding_stage = 'complete'::public.onboarding_stage
          and onboarding_password_changed_at is not null
          and onboarding_completed_at is not null
        )
      )
    )
  );

-- Admin-created Customer profiles may begin without a phone number, but the
-- Customer cannot complete onboarding until a valid Philippine mobile number
-- has been supplied.
alter table public.profiles drop constraint if exists profiles_phone_ph;

alter table public.profiles
add constraint profiles_phone_ph check (
  (
    role = 'customer'::public.user_role
    and (
      (
        onboarding_stage <> 'complete'::public.onboarding_stage
        and (phone = '' or phone ~ '^09[0-9]{9}$')
      )
      or
      (
        onboarding_stage = 'complete'::public.onboarding_stage
        and phone ~ '^09[0-9]{9}$'
      )
    )
  )
  or
  (
    role in ('admin'::public.user_role, 'deliverer'::public.user_role)
    and (phone = '' or phone ~ '^09[0-9]{9}$')
  )
);

-- The same legal documents apply to Customers who are created by an Admin and
-- accept them during first-login onboarding.
alter table public.legal_acceptances drop constraint if exists legal_acceptances_source;
alter table public.legal_acceptances
  add constraint legal_acceptances_source check (
    source in ('customer_registration', 'admin_onboarding')
  );

-- Incomplete Administrators are authenticated but are not administrators for
-- authorization purposes until onboarding is complete.
create or replace function private.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'::public.user_role
      and status = 'active'::public.profile_status
      and onboarding_stage = 'complete'::public.onboarding_stage
  );
$$;

revoke all on function private.is_active_admin() from public;
revoke all on function private.is_active_admin() from anon;
grant execute on function private.is_active_admin() to authenticated;

-- Keep public signup behavior explicit. Self-registered Customers are already
-- complete after the existing email-verification flow and legal acceptance.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_name text;
  normalized_phone text;
  submitted_terms_version text;
  submitted_privacy_version text;
  terms_accepted boolean;
  privacy_acknowledged boolean;
  has_registration_metadata boolean;
begin
  has_registration_metadata :=
    coalesce(new.raw_user_meta_data ? 'full_name', false)
    or coalesce(new.raw_user_meta_data ? 'phone', false)
    or coalesce(new.raw_user_meta_data ? 'terms_version', false)
    or coalesce(new.raw_user_meta_data ? 'privacy_version', false)
    or coalesce(new.raw_user_meta_data ? 'terms_accepted', false)
    or coalesce(new.raw_user_meta_data ? 'privacy_acknowledged', false);

  if not has_registration_metadata then
    return new;
  end if;

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

  if not terms_accepted
     or not privacy_acknowledged
     or submitted_terms_version <> '1.0'
     or submitted_privacy_version <> '1.0' then
    raise exception 'Current registration agreement is required';
  end if;

  insert into public.profiles (
    id,
    email,
    full_name,
    phone,
    role,
    status,
    account_origin,
    onboarding_stage,
    onboarding_password_changed_at,
    onboarding_completed_at
  )
  values (
    new.id,
    lower(btrim(coalesce(new.email, ''))),
    normalized_name,
    normalized_phone,
    'customer'::public.user_role,
    'active'::public.profile_status,
    'self_registered'::public.account_origin,
    'complete'::public.onboarding_stage,
    null,
    now()
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

revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon;
revoke all on function public.handle_new_user() from authenticated;

-- Replace the provisioning RPC so every new Admin-created account begins in
-- the forced-password stage. Phone is intentionally optional at provisioning.
create or replace function public.provision_admin_managed_profile(
  p_actor_id uuid,
  p_user_id uuid,
  p_email text,
  p_full_name text,
  p_phone text,
  p_role public.user_role
)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile public.profiles;
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_name text := btrim(coalesce(p_full_name, ''));
  v_phone text := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
begin
  if not exists (
    select 1 from public.profiles
    where id = p_actor_id
      and role = 'admin'::public.user_role
      and status = 'active'::public.profile_status
      and onboarding_stage = 'complete'::public.onboarding_stage
  ) then
    raise exception 'Admin authorization required';
  end if;

  if not exists (
    select 1 from auth.users
    where id = p_user_id and lower(email) = v_email
  ) then
    raise exception 'Auth user does not match profile request';
  end if;

  if char_length(v_name) < 2 or char_length(v_name) > 60 or v_name ~ '[<>[:cntrl:]]' then
    raise exception 'Invalid profile data';
  end if;

  if v_phone <> '' and v_phone !~ '^09[0-9]{9}$' then
    raise exception 'Invalid profile phone';
  end if;

  insert into public.profiles (
    id,
    email,
    full_name,
    phone,
    role,
    status,
    account_origin,
    onboarding_stage,
    onboarding_password_changed_at,
    onboarding_completed_at
  )
  values (
    p_user_id,
    v_email,
    v_name,
    v_phone,
    p_role,
    'active'::public.profile_status,
    'admin_managed'::public.account_origin,
    'password_required'::public.onboarding_stage,
    null,
    null
  )
  returning * into v_profile;

  insert into public.admin_account_audit (
    actor_id,
    target_user_id,
    target_email,
    action,
    target_role
  )
  values (p_actor_id, p_user_id, v_email, 'account_created', p_role);

  return v_profile;
end;
$$;

revoke all on function public.provision_admin_managed_profile(uuid, uuid, text, text, text, public.user_role) from public;
revoke all on function public.provision_admin_managed_profile(uuid, uuid, text, text, text, public.user_role) from anon;
revoke all on function public.provision_admin_managed_profile(uuid, uuid, text, text, text, public.user_role) from authenticated;
grant execute on function public.provision_admin_managed_profile(uuid, uuid, text, text, text, public.user_role) to service_role;

-- Called only by server-side code after Supabase Auth successfully replaces the
-- temporary password. The transition is idempotent to tolerate safe retries.
create or replace function public.advance_admin_managed_onboarding_password(
  p_user_id uuid
)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile public.profiles;
begin
  select * into v_profile
  from public.profiles
  where id = p_user_id
  for update;

  if v_profile.id is null
     or v_profile.status <> 'active'::public.profile_status
     or v_profile.account_origin <> 'admin_managed'::public.account_origin then
    raise exception 'Account is not eligible for onboarding';
  end if;

  if v_profile.onboarding_stage = 'password_required'::public.onboarding_stage then
    update public.profiles
    set onboarding_stage = 'profile_required'::public.onboarding_stage,
        onboarding_password_changed_at = now(),
        onboarding_completed_at = null
    where id = p_user_id
    returning * into v_profile;
  elsif v_profile.onboarding_stage <> 'profile_required'::public.onboarding_stage then
    raise exception 'Password onboarding stage is already complete';
  end if;

  return v_profile;
end;
$$;

revoke all on function public.advance_admin_managed_onboarding_password(uuid) from public;
revoke all on function public.advance_admin_managed_onboarding_password(uuid) from anon;
revoke all on function public.advance_admin_managed_onboarding_password(uuid) from authenticated;
grant execute on function public.advance_admin_managed_onboarding_password(uuid) to service_role;

-- Completes the profile step in one database transaction. Customer legal
-- acceptance is recorded here before the account becomes application-ready.
create or replace function public.complete_admin_managed_onboarding(
  p_user_id uuid,
  p_full_name text,
  p_phone text,
  p_terms_version text default null,
  p_privacy_version text default null
)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile public.profiles;
  v_name text := btrim(coalesce(p_full_name, ''));
  v_phone text := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
begin
  select * into v_profile
  from public.profiles
  where id = p_user_id
  for update;

  if v_profile.id is null
     or v_profile.status <> 'active'::public.profile_status
     or v_profile.account_origin <> 'admin_managed'::public.account_origin
     or v_profile.onboarding_stage <> 'profile_required'::public.onboarding_stage
     or v_profile.onboarding_password_changed_at is null then
    raise exception 'Account is not ready to complete onboarding';
  end if;

  if char_length(v_name) < 2 or char_length(v_name) > 60 or v_name ~ '[<>[:cntrl:]]' then
    raise exception 'Invalid profile data';
  end if;

  if v_profile.role = 'customer'::public.user_role then
    if v_phone !~ '^09[0-9]{9}$' then
      raise exception 'Customer phone is required';
    end if;

    if btrim(coalesce(p_terms_version, '')) <> '1.0'
       or btrim(coalesce(p_privacy_version, '')) <> '1.0' then
      raise exception 'Current customer agreement is required';
    end if;

    insert into public.legal_acceptances (
      user_id,
      terms_version,
      privacy_version,
      accepted_at,
      source
    )
    values (
      p_user_id,
      '1.0',
      '1.0',
      now(),
      'admin_onboarding'
    )
    on conflict (user_id, terms_version, privacy_version) do nothing;
  else
    if v_phone <> '' and v_phone !~ '^09[0-9]{9}$' then
      raise exception 'Invalid profile phone';
    end if;
  end if;

  update public.profiles
  set full_name = v_name,
      phone = v_phone,
      onboarding_stage = 'complete'::public.onboarding_stage,
      onboarding_completed_at = now()
  where id = p_user_id
  returning * into v_profile;

  return v_profile;
end;
$$;

revoke all on function public.complete_admin_managed_onboarding(uuid, text, text, text, text) from public;
revoke all on function public.complete_admin_managed_onboarding(uuid, text, text, text, text) from anon;
revoke all on function public.complete_admin_managed_onboarding(uuid, text, text, text, text) from authenticated;
grant execute on function public.complete_admin_managed_onboarding(uuid, text, text, text, text) to service_role;

comment on column public.profiles.account_origin is
  'Server-controlled origin of the application account. Admin-managed accounts require first-login onboarding.';
comment on column public.profiles.onboarding_stage is
  'Server-controlled first-login stage. Only complete accounts may enter role workspaces.';
comment on column public.profiles.onboarding_password_changed_at is
  'Trusted server timestamp set only after the temporary password is replaced.';
comment on column public.profiles.onboarding_completed_at is
  'Trusted server timestamp indicating the account may enter its application workspace.';

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

  -- Dashboard/server-side administrative provisioning may create an already
  -- confirmed Auth user without customer-registration metadata. Leave that
  -- Auth user without an application profile until a trusted Admin workflow
  -- supplies the profile details and role.
  if not has_registration_metadata then
    if new.email_confirmed_at is not null then
      return new;
    end if;

    raise exception 'Registration profile data is required';
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

-- Trigger helpers should only be invoked by PostgreSQL, never through the
-- exposed REST/RPC API.
revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon;
revoke all on function public.handle_new_user() from authenticated;

revoke all on function public.rls_auto_enable() from public;
revoke all on function public.rls_auto_enable() from anon;
revoke all on function public.rls_auto_enable() from authenticated;

-- Unify Admin identity management under Accounts and protect permanent deletion.
-- Customer and Deliverer profiles share the same managed-account update path.
-- Administrator accounts can only be permanently deleted by their own owner,
-- and the last active, fully onboarded Administrator can never be removed.

alter table public.profiles
  add column if not exists deletion_reserved_at timestamptz,
  add column if not exists deletion_reserved_by uuid;

alter table public.profiles
  drop constraint if exists profiles_deletion_reservation_consistency;

alter table public.profiles
  add constraint profiles_deletion_reservation_consistency check (
    (deletion_reserved_at is null and deletion_reserved_by is null)
    or
    (deletion_reserved_at is not null and deletion_reserved_by is not null)
  );

alter table public.admin_account_audit
  drop constraint if exists admin_account_audit_action;

alter table public.admin_account_audit
  add constraint admin_account_audit_action check (
    action in (
      'account_created',
      'customer_updated',
      'account_updated',
      'account_deletion_reserved',
      'account_deletion_restored',
      'account_deleted'
    )
  );

create or replace function public.admin_update_managed_profile(
  p_actor_id uuid,
  p_target_id uuid,
  p_full_name text,
  p_phone text,
  p_status public.profile_status
)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor public.profiles;
  v_profile public.profiles;
  v_name text := btrim(coalesce(p_full_name, ''));
  v_phone text := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
begin
  select * into v_actor
  from public.profiles
  where id = p_actor_id;

  if v_actor.id is null
     or v_actor.role <> 'admin'::public.user_role
     or v_actor.status <> 'active'::public.profile_status
     or v_actor.onboarding_stage <> 'complete'::public.onboarding_stage
     or v_actor.deletion_reserved_at is not null then
    raise exception 'Admin authorization required';
  end if;

  select * into v_profile
  from public.profiles
  where id = p_target_id
  for update;

  if v_profile.id is null then
    raise exception 'Account not found';
  end if;

  if v_profile.deletion_reserved_at is not null then
    raise exception 'Account deletion is already in progress';
  end if;

  -- Administrator accounts are intentionally excluded from shared account
  -- editing. Their privileged identity cannot be altered by another Admin.
  if v_profile.role = 'admin'::public.user_role then
    raise exception 'Administrator accounts cannot be edited here';
  end if;

  if char_length(v_name) < 2 or char_length(v_name) > 60 or v_name ~ '[<>[:cntrl:]]' then
    raise exception 'Invalid profile data';
  end if;

  if v_profile.role = 'customer'::public.user_role
     and v_profile.onboarding_stage = 'complete'::public.onboarding_stage
     and v_phone !~ '^09[0-9]{9}$' then
    raise exception 'Customer phone is required';
  end if;

  if (
      v_profile.role <> 'customer'::public.user_role
      or v_profile.onboarding_stage <> 'complete'::public.onboarding_stage
     )
     and v_phone <> ''
     and v_phone !~ '^09[0-9]{9}$' then
    raise exception 'Invalid profile phone';
  end if;

  update public.profiles
  set full_name = v_name,
      phone = v_phone,
      status = p_status
  where id = p_target_id
  returning * into v_profile;

  insert into public.admin_account_audit (
    actor_id,
    target_user_id,
    target_email,
    action,
    target_role
  )
  values (
    p_actor_id,
    v_profile.id,
    v_profile.email,
    'account_updated',
    v_profile.role
  );

  return v_profile;
end;
$$;

revoke all on function public.admin_update_managed_profile(uuid, uuid, text, text, public.profile_status) from public;
revoke all on function public.admin_update_managed_profile(uuid, uuid, text, text, public.profile_status) from anon;
revoke all on function public.admin_update_managed_profile(uuid, uuid, text, text, public.profile_status) from authenticated;
grant execute on function public.admin_update_managed_profile(uuid, uuid, text, text, public.profile_status) to service_role;

create or replace function public.reserve_admin_account_deletion(
  p_actor_id uuid,
  p_target_id uuid
)
returns table (
  target_user_id uuid,
  target_email text,
  target_role public.user_role,
  previous_status public.profile_status
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor public.profiles;
  v_target public.profiles;
  v_active_admin_count integer;
begin
  select * into v_actor
  from public.profiles
  where id = p_actor_id;

  if v_actor.id is null
     or v_actor.role <> 'admin'::public.user_role
     or v_actor.status <> 'active'::public.profile_status
     or v_actor.onboarding_stage <> 'complete'::public.onboarding_stage
     or v_actor.deletion_reserved_at is not null then
    raise exception 'Admin authorization required';
  end if;

  select * into v_target
  from public.profiles
  where id = p_target_id
  for update;

  if v_target.id is null then
    raise exception 'Account not found';
  end if;

  if v_target.deletion_reserved_at is not null then
    raise exception 'Account deletion is already in progress';
  end if;

  if v_target.role = 'admin'::public.user_role then
    if v_target.id <> p_actor_id then
      raise exception 'Administrator accounts can only be deleted by their owner';
    end if;

    -- Serialize privileged self-deletion checks. Once one Administrator is
    -- reserved, a concurrent request observes the reduced active count.
    perform pg_advisory_xact_lock(hashtext('mrje_admin_account_deletion')::bigint);

    select * into v_actor
    from public.profiles
    where id = p_actor_id
    for update;

    if v_actor.id is null
       or v_actor.status <> 'active'::public.profile_status
       or v_actor.onboarding_stage <> 'complete'::public.onboarding_stage
       or v_actor.deletion_reserved_at is not null then
      raise exception 'Administrator session is no longer active';
    end if;

    select count(*) into v_active_admin_count
    from public.profiles
    where role = 'admin'::public.user_role
      and status = 'active'::public.profile_status
      and onboarding_stage = 'complete'::public.onboarding_stage
      and deletion_reserved_at is null;

    if v_active_admin_count <= 1 then
      raise exception 'The last active Administrator cannot be deleted';
    end if;
  end if;

  target_user_id := v_target.id;
  target_email := v_target.email;
  target_role := v_target.role;
  previous_status := v_target.status;

  update public.profiles
  set status = 'inactive'::public.profile_status,
      deletion_reserved_at = now(),
      deletion_reserved_by = p_actor_id
  where id = v_target.id;

  insert into public.admin_account_audit (
    actor_id,
    target_user_id,
    target_email,
    action,
    target_role
  )
  values (
    p_actor_id,
    v_target.id,
    v_target.email,
    'account_deletion_reserved',
    v_target.role
  );

  return next;
end;
$$;

revoke all on function public.reserve_admin_account_deletion(uuid, uuid) from public;
revoke all on function public.reserve_admin_account_deletion(uuid, uuid) from anon;
revoke all on function public.reserve_admin_account_deletion(uuid, uuid) from authenticated;
grant execute on function public.reserve_admin_account_deletion(uuid, uuid) to service_role;

create or replace function public.restore_admin_account_deletion(
  p_actor_id uuid,
  p_target_id uuid,
  p_previous_status public.profile_status
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_target public.profiles;
begin
  update public.profiles
  set status = p_previous_status,
      deletion_reserved_at = null,
      deletion_reserved_by = null
  where id = p_target_id
    and deletion_reserved_by = p_actor_id
  returning * into v_target;

  if v_target.id is null then
    return false;
  end if;

  insert into public.admin_account_audit (
    actor_id,
    target_user_id,
    target_email,
    action,
    target_role
  )
  values (
    p_actor_id,
    v_target.id,
    v_target.email,
    'account_deletion_restored',
    v_target.role
  );

  return true;
end;
$$;

revoke all on function public.restore_admin_account_deletion(uuid, uuid, public.profile_status) from public;
revoke all on function public.restore_admin_account_deletion(uuid, uuid, public.profile_status) from anon;
revoke all on function public.restore_admin_account_deletion(uuid, uuid, public.profile_status) from authenticated;
grant execute on function public.restore_admin_account_deletion(uuid, uuid, public.profile_status) to service_role;

create or replace function public.record_admin_account_deleted(
  p_actor_id uuid,
  p_target_id uuid,
  p_target_email text,
  p_target_role public.user_role
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_target_id is null
     or p_actor_id is null
     or p_target_role is null
     or char_length(btrim(coalesce(p_target_email, ''))) < 3
     or char_length(btrim(coalesce(p_target_email, ''))) > 254 then
    raise exception 'Invalid deletion audit data';
  end if;

  insert into public.admin_account_audit (
    actor_id,
    target_user_id,
    target_email,
    action,
    target_role
  )
  values (
    p_actor_id,
    p_target_id,
    lower(btrim(p_target_email)),
    'account_deleted',
    p_target_role
  );
end;
$$;

revoke all on function public.record_admin_account_deleted(uuid, uuid, text, public.user_role) from public;
revoke all on function public.record_admin_account_deleted(uuid, uuid, text, public.user_role) from anon;
revoke all on function public.record_admin_account_deleted(uuid, uuid, text, public.user_role) from authenticated;
grant execute on function public.record_admin_account_deleted(uuid, uuid, text, public.user_role) to service_role;

comment on column public.profiles.deletion_reserved_at is
  'Server-controlled reservation timestamp used to prevent concurrent mutation while permanent Auth deletion is in progress.';
comment on column public.profiles.deletion_reserved_by is
  'Server-controlled Administrator ID that reserved this account for permanent deletion.';

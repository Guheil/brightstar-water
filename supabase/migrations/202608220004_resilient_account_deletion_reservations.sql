-- Make deletion reservations crash-safe. Reservation metadata coordinates
-- concurrent deletes without changing the account's existing active/inactive
-- state. Reservations older than ten minutes are treated as stale and may be
-- safely reclaimed by a new authorized deletion attempt.

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
     or v_actor.onboarding_stage <> 'complete'::public.onboarding_stage then
    raise exception 'Admin authorization required';
  end if;

  select * into v_target
  from public.profiles
  where id = p_target_id
  for update;

  if v_target.id is null then
    raise exception 'Account not found';
  end if;

  if v_target.deletion_reserved_at is not null
     and v_target.deletion_reserved_at > now() - interval '10 minutes' then
    raise exception 'Account deletion is already in progress';
  end if;

  -- Recover a stale reservation without changing the underlying account state.
  if v_target.deletion_reserved_at is not null then
    update public.profiles
    set deletion_reserved_at = null,
        deletion_reserved_by = null
    where id = v_target.id;

    v_target.deletion_reserved_at := null;
    v_target.deletion_reserved_by := null;
  end if;

  if v_target.role = 'admin'::public.user_role then
    if v_target.id <> p_actor_id then
      raise exception 'Administrator accounts can only be deleted by their owner';
    end if;

    perform pg_advisory_xact_lock(hashtext('mrje_admin_account_deletion')::bigint);

    select * into v_actor
    from public.profiles
    where id = p_actor_id
    for update;

    if v_actor.id is null
       or v_actor.status <> 'active'::public.profile_status
       or v_actor.onboarding_stage <> 'complete'::public.onboarding_stage then
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
  set deletion_reserved_at = now(),
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
  set deletion_reserved_at = null,
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

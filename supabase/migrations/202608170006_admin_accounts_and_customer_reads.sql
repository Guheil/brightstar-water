-- Real Admin account management and live Customer reads.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

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
  );
$$;

revoke all on function private.is_active_admin() from public;
revoke all on function private.is_active_admin() from anon;
grant execute on function private.is_active_admin() to authenticated;

create policy "profiles_admin_select_all"
on public.profiles
for select
to authenticated
using ((select private.is_active_admin()));

-- Server-side searches are bounded and paginated. Trigram indexes keep
-- contains-search on name/email responsive as the profile table grows.
create extension if not exists pg_trgm with schema extensions;
create index if not exists profiles_full_name_trgm_idx
  on public.profiles using gin (full_name extensions.gin_trgm_ops);
create index if not exists profiles_email_trgm_idx
  on public.profiles using gin (email extensions.gin_trgm_ops);
create index if not exists profiles_created_at_idx
  on public.profiles (created_at desc, id);

create table if not exists public.admin_account_audit (
  id bigint generated always as identity primary key,
  actor_id uuid not null,
  target_user_id uuid not null,
  target_email text not null,
  action text not null,
  target_role public.user_role not null,
  created_at timestamptz not null default now(),
  constraint admin_account_audit_action check (
    action in ('account_created', 'customer_updated')
  ),
  constraint admin_account_audit_email_length check (char_length(target_email) between 3 and 254)
);

create index if not exists admin_account_audit_actor_created_idx
  on public.admin_account_audit (actor_id, created_at desc);
create index if not exists admin_account_audit_target_created_idx
  on public.admin_account_audit (target_user_id, created_at desc);

alter table public.admin_account_audit enable row level security;
revoke all privileges on table public.admin_account_audit from anon, authenticated;

create table if not exists public.admin_api_rate_limits (
  rate_key text primary key,
  window_started_at timestamptz not null,
  request_count integer not null,
  updated_at timestamptz not null default now(),
  constraint admin_api_rate_limits_key_length check (char_length(rate_key) between 3 and 200),
  constraint admin_api_rate_limits_count_positive check (request_count > 0)
);

alter table public.admin_api_rate_limits enable row level security;
revoke all privileges on table public.admin_api_rate_limits from anon, authenticated;

create or replace function public.consume_admin_api_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns table (allowed boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window_started_at timestamptz;
  v_request_count integer;
  v_window interval;
begin
  if p_key is null or char_length(p_key) < 3 or char_length(p_key) > 200 then
    raise exception 'Invalid rate limit key';
  end if;
  if p_limit < 1 or p_limit > 1000 then
    raise exception 'Invalid rate limit';
  end if;
  if p_window_seconds < 1 or p_window_seconds > 86400 then
    raise exception 'Invalid rate limit window';
  end if;

  v_window := make_interval(secs => p_window_seconds);

  insert into public.admin_api_rate_limits (
    rate_key,
    window_started_at,
    request_count,
    updated_at
  )
  values (p_key, now(), 1, now())
  on conflict (rate_key) do update
  set
    window_started_at = case
      when public.admin_api_rate_limits.window_started_at + v_window <= now() then now()
      else public.admin_api_rate_limits.window_started_at
    end,
    request_count = case
      when public.admin_api_rate_limits.window_started_at + v_window <= now() then 1
      else public.admin_api_rate_limits.request_count + 1
    end,
    updated_at = now()
  returning window_started_at, request_count
  into v_window_started_at, v_request_count;

  allowed := v_request_count <= p_limit;
  retry_after_seconds := case
    when allowed then 0
    else greatest(
      1,
      ceil(extract(epoch from (v_window_started_at + v_window - now())))::integer
    )
  end;

  return next;
end;
$$;

revoke all on function public.consume_admin_api_rate_limit(text, integer, integer) from public;
revoke all on function public.consume_admin_api_rate_limit(text, integer, integer) from anon;
revoke all on function public.consume_admin_api_rate_limit(text, integer, integer) from authenticated;
grant execute on function public.consume_admin_api_rate_limit(text, integer, integer) to service_role;

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

  if p_role = 'customer'::public.user_role and v_phone !~ '^09[0-9]{9}$' then
    raise exception 'Customer phone is required';
  end if;

  if p_role <> 'customer'::public.user_role and v_phone <> '' and v_phone !~ '^09[0-9]{9}$' then
    raise exception 'Invalid profile phone';
  end if;

  insert into public.profiles (id, email, full_name, phone, role, status)
  values (p_user_id, v_email, v_name, v_phone, p_role, 'active'::public.profile_status)
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

create or replace function public.admin_update_customer_profile(
  p_actor_id uuid,
  p_customer_id uuid,
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
  v_profile public.profiles;
  v_name text := btrim(coalesce(p_full_name, ''));
  v_phone text := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
begin
  if not exists (
    select 1 from public.profiles
    where id = p_actor_id
      and role = 'admin'::public.user_role
      and status = 'active'::public.profile_status
  ) then
    raise exception 'Admin authorization required';
  end if;

  if char_length(v_name) < 2 or char_length(v_name) > 60 or v_name ~ '[<>[:cntrl:]]' then
    raise exception 'Invalid profile data';
  end if;

  if v_phone !~ '^09[0-9]{9}$' then
    raise exception 'Customer phone is required';
  end if;

  update public.profiles
  set full_name = v_name,
      phone = v_phone,
      status = p_status
  where id = p_customer_id
    and role = 'customer'::public.user_role
  returning * into v_profile;

  if v_profile.id is null then
    raise exception 'Customer not found';
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
    v_profile.id,
    v_profile.email,
    'customer_updated',
    'customer'::public.user_role
  );

  return v_profile;
end;
$$;

revoke all on function public.admin_update_customer_profile(uuid, uuid, text, text, public.profile_status) from public;
revoke all on function public.admin_update_customer_profile(uuid, uuid, text, text, public.profile_status) from anon;
revoke all on function public.admin_update_customer_profile(uuid, uuid, text, text, public.profile_status) from authenticated;
grant execute on function public.admin_update_customer_profile(uuid, uuid, text, text, public.profile_status) to service_role;

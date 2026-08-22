-- MRJE + Bright Star human-readable, append-only business audit ledger.
-- The ledger lives in the existing private schema. Browser roles have no table
-- privileges. Server-side code reads and writes through narrowly-scoped,
-- service-role-only RPCs. Existing admin_account_audit rows are backfilled and
-- preserved for rollback/history, but new account/onboarding events use this ledger.

create schema if not exists private;

create table if not exists private.audit_events (
  id bigint generated always as identity primary key,
  event_id uuid not null default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  event_code text not null,
  category text not null,
  result text not null default 'success',
  summary text not null,
  actor_user_id uuid,
  actor_name text not null,
  actor_role text not null,
  target_type text,
  target_id uuid,
  target_label text,
  changes jsonb not null default '{}'::jsonb,
  details jsonb not null default '{}'::jsonb,
  reason text,
  request_id uuid not null default gen_random_uuid(),
  source text not null,
  client_ip inet,
  user_agent text,
  schema_version smallint not null default 1,
  legacy_source text,
  legacy_id bigint,
  constraint audit_events_event_id_unique unique (event_id),
  constraint audit_events_event_code_format check (
    char_length(event_code) between 3 and 80
    and event_code ~ '^[a-z0-9]+([._][a-z0-9]+)*$'
  ),
  constraint audit_events_category check (
    category in ('accounts', 'onboarding', 'security', 'orders', 'products', 'inventory', 'deliveries', 'payments', 'loyalty', 'system')
  ),
  constraint audit_events_result check (result in ('success', 'failed', 'denied')),
  constraint audit_events_summary check (
    char_length(btrim(summary)) between 3 and 500
    and summary = btrim(summary)
    and summary !~ '[<>[:cntrl:]]'
  ),
  constraint audit_events_actor_name check (
    char_length(btrim(actor_name)) between 2 and 100
    and actor_name = btrim(actor_name)
    and actor_name !~ '[<>[:cntrl:]]'
  ),
  constraint audit_events_actor_role check (
    actor_role in ('customer', 'admin', 'deliverer', 'system')
  ),
  constraint audit_events_target_type check (
    target_type is null
    or target_type in ('account', 'order', 'product', 'inventory', 'delivery', 'payment', 'loyalty', 'system')
  ),
  constraint audit_events_target_label check (
    target_label is null
    or (
      char_length(btrim(target_label)) between 1 and 160
      and target_label = btrim(target_label)
      and target_label !~ '[<>[:cntrl:]]'
    )
  ),
  constraint audit_events_changes_object check (jsonb_typeof(changes) = 'object'),
  constraint audit_events_changes_size check (octet_length(changes::text) <= 16384),
  constraint audit_events_details_object check (jsonb_typeof(details) = 'object'),
  constraint audit_events_details_size check (octet_length(details::text) <= 16384),
  constraint audit_events_reason check (
    reason is null
    or (
      char_length(btrim(reason)) between 3 and 500
      and reason = btrim(reason)
      and reason !~ '[<>[:cntrl:]]'
    )
  ),
  constraint audit_events_source check (
    source in ('admin_dashboard', 'onboarding', 'customer_portal', 'deliverer_app', 'system')
  ),
  constraint audit_events_user_agent_length check (
    user_agent is null or char_length(user_agent) <= 500
  ),
  constraint audit_events_schema_version check (schema_version between 1 and 100),
  constraint audit_events_legacy_pair check (
    (legacy_source is null and legacy_id is null)
    or (legacy_source is not null and legacy_id is not null)
  )
);

create unique index if not exists audit_events_legacy_unique_idx
  on private.audit_events (legacy_source, legacy_id)
  where legacy_source is not null and legacy_id is not null;

create index if not exists audit_events_occurred_idx
  on private.audit_events (occurred_at desc, id desc);

create index if not exists audit_events_actor_occurred_idx
  on private.audit_events (actor_user_id, occurred_at desc, id desc)
  where actor_user_id is not null;

create index if not exists audit_events_category_occurred_idx
  on private.audit_events (category, occurred_at desc, id desc);

create index if not exists audit_events_result_occurred_idx
  on private.audit_events (result, occurred_at desc, id desc);

create index if not exists audit_events_target_occurred_idx
  on private.audit_events (target_type, target_id, occurred_at desc, id desc)
  where target_id is not null;

-- pg_trgm was installed by 202608170006. This expression index matches the
-- bounded activity-history search performed by list_admin_audit_events.
create index if not exists audit_events_search_trgm_idx
  on private.audit_events using gin (
    (
      summary || ' ' || actor_name || ' ' || coalesce(target_label, '') || ' ' || event_code
    ) extensions.gin_trgm_ops
  );

alter table private.audit_events enable row level security;
revoke all privileges on table private.audit_events from public, anon, authenticated;

comment on table private.audit_events is
  'Append-only business audit ledger. Human-readable summaries are paired with structured, privacy-minimized event details and correlation IDs.';
comment on column private.audit_events.request_id is
  'Correlation ID shared by related steps in one user/system operation.';
comment on column private.audit_events.changes is
  'Only meaningful before/after values. Credentials, OTPs, tokens, and raw request bodies must never be recorded.';
comment on column private.audit_events.client_ip is
  'Restricted forensic context. Never surfaced in the normal activity list; details are Admin-only.';

create or replace function private.prevent_audit_event_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception 'Audit events are append-only';
end;
$$;

drop trigger if exists audit_events_prevent_mutation on private.audit_events;
create trigger audit_events_prevent_mutation
before update or delete on private.audit_events
for each row execute procedure private.prevent_audit_event_mutation();

revoke all on function private.prevent_audit_event_mutation() from public, anon, authenticated;

create or replace function private.safe_audit_inet(p_value text)
returns inet
language plpgsql
immutable
security invoker
set search_path = ''
as $$
begin
  if p_value is null or btrim(p_value) = '' or char_length(btrim(p_value)) > 64 then
    return null;
  end if;

  begin
    return btrim(p_value)::inet;
  exception when invalid_text_representation then
    return null;
  end;
end;
$$;

revoke all on function private.safe_audit_inet(text) from public, anon, authenticated;

create or replace function private.mask_audit_phone(p_value text)
returns text
language sql
immutable
security invoker
set search_path = ''
as $$
  select case
    when p_value is null or btrim(p_value) = '' then ''
    when char_length(regexp_replace(p_value, '[^0-9]', '', 'g')) >= 7 then
      left(regexp_replace(p_value, '[^0-9]', '', 'g'), 4)
      || '••••'
      || right(regexp_replace(p_value, '[^0-9]', '', 'g'), 3)
    else '••••'
  end;
$$;

revoke all on function private.mask_audit_phone(text) from public, anon, authenticated;

create or replace function private.write_audit_event(
  p_event_code text,
  p_category text,
  p_result text,
  p_summary text,
  p_actor_user_id uuid,
  p_actor_name text,
  p_actor_role text,
  p_target_type text,
  p_target_id uuid,
  p_target_label text,
  p_changes jsonb,
  p_details jsonb,
  p_reason text,
  p_request_id uuid,
  p_source text,
  p_client_ip text,
  p_user_agent text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event_id uuid;
  v_user_agent text;
begin
  if p_request_id is null then
    raise exception 'Audit request ID is required';
  end if;

  v_user_agent := nullif(left(regexp_replace(coalesce(p_user_agent, ''), '[[:cntrl:]]', '', 'g'), 500), '');

  insert into private.audit_events (
    event_code,
    category,
    result,
    summary,
    actor_user_id,
    actor_name,
    actor_role,
    target_type,
    target_id,
    target_label,
    changes,
    details,
    reason,
    request_id,
    source,
    client_ip,
    user_agent
  )
  values (
    p_event_code,
    p_category,
    p_result,
    btrim(p_summary),
    p_actor_user_id,
    btrim(p_actor_name),
    p_actor_role,
    p_target_type,
    p_target_id,
    nullif(btrim(coalesce(p_target_label, '')), ''),
    coalesce(p_changes, '{}'::jsonb),
    coalesce(p_details, '{}'::jsonb),
    nullif(btrim(coalesce(p_reason, '')), ''),
    p_request_id,
    p_source,
    private.safe_audit_inet(p_client_ip),
    v_user_agent
  )
  returning event_id into v_event_id;

  return v_event_id;
end;
$$;

revoke all on function private.write_audit_event(text, text, text, text, uuid, text, text, text, uuid, text, jsonb, jsonb, text, uuid, text, text, text)
  from public, anon, authenticated, service_role;

-- Backfill the existing narrow account audit table exactly once. Missing
-- profile rows are expected for accounts that were already permanently deleted.
insert into private.audit_events (
  event_code,
  category,
  result,
  summary,
  actor_user_id,
  actor_name,
  actor_role,
  target_type,
  target_id,
  target_label,
  changes,
  details,
  request_id,
  source,
  legacy_source,
  legacy_id,
  occurred_at
)
select
  case a.action
    when 'account_created' then 'account.created'
    when 'customer_updated' then 'account.updated'
    when 'account_updated' then 'account.updated'
    when 'account_deletion_reserved' then 'account.deletion_started'
    when 'account_deletion_restored' then 'account.deletion_restored'
    when 'account_deleted' then 'account.deleted'
    else 'account.legacy_event'
  end,
  'accounts',
  'success',
  case a.action
    when 'account_created' then
      coalesce(actor.full_name, 'Administrator') || ' created a ' || initcap(a.target_role::text) || ' account for ' || coalesce(target.full_name, a.target_email) || '.'
    when 'customer_updated' then
      coalesce(actor.full_name, 'Administrator') || ' updated ' || coalesce(target.full_name, a.target_email) || '''s account information.'
    when 'account_updated' then
      coalesce(actor.full_name, 'Administrator') || ' updated ' || coalesce(target.full_name, a.target_email) || '''s account information.'
    when 'account_deletion_reserved' then
      coalesce(actor.full_name, 'Administrator') || ' started deleting ' || coalesce(target.full_name, a.target_email) || '''s ' || initcap(a.target_role::text) || ' account.'
    when 'account_deletion_restored' then
      'Deletion of ' || coalesce(target.full_name, a.target_email) || '''s ' || initcap(a.target_role::text) || ' account was stopped and the account was restored.'
    when 'account_deleted' then
      coalesce(actor.full_name, 'Administrator') || ' permanently deleted the ' || initcap(a.target_role::text) || ' account for ' || coalesce(target.full_name, a.target_email) || '.'
    else
      coalesce(actor.full_name, 'Administrator') || ' performed an account-management action affecting ' || coalesce(target.full_name, a.target_email) || '.'
  end,
  a.actor_id,
  coalesce(actor.full_name, 'Administrator'),
  'admin',
  'account',
  a.target_user_id,
  coalesce(target.full_name, a.target_email),
  '{}'::jsonb,
  jsonb_build_object(
    'role', a.target_role::text,
    'email', a.target_email,
    'legacy_action', a.action
  ),
  gen_random_uuid(),
  'admin_dashboard',
  'admin_account_audit',
  a.id,
  a.created_at
from public.admin_account_audit a
left join public.profiles actor on actor.id = a.actor_id
left join public.profiles target on target.id = a.target_user_id
on conflict (legacy_source, legacy_id) where legacy_source is not null and legacy_id is not null do nothing;

-- Secure, service-role-only list RPC. It returns only lightweight list fields;
-- structured changes/security context are loaded by get_admin_audit_event.
create or replace function public.list_admin_audit_events(
  p_category text,
  p_result text,
  p_actor_id uuid,
  p_query text,
  p_from timestamptz,
  p_to timestamptz,
  p_cursor_occurred_at timestamptz,
  p_cursor_id bigint,
  p_limit integer
)
returns table (
  id bigint,
  event_id uuid,
  occurred_at timestamptz,
  event_code text,
  category text,
  result text,
  summary text,
  actor_user_id uuid,
  actor_name text,
  actor_role text,
  target_type text,
  target_id uuid,
  target_label text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_limit integer;
  v_query text;
  v_pattern text;
begin
  v_limit := least(greatest(coalesce(p_limit, 25), 1), 100);
  v_query := nullif(btrim(coalesce(p_query, '')), '');

  if v_query is not null and char_length(v_query) > 80 then
    raise exception 'Audit search is too long';
  end if;

  if p_category is not null and p_category not in ('accounts', 'onboarding', 'security', 'orders', 'products', 'inventory', 'deliveries', 'payments', 'loyalty', 'system') then
    raise exception 'Invalid audit category';
  end if;

  if p_result is not null and p_result not in ('success', 'failed', 'denied') then
    raise exception 'Invalid audit result';
  end if;

  if (p_cursor_occurred_at is null) <> (p_cursor_id is null) then
    raise exception 'Incomplete audit cursor';
  end if;

  if v_query is not null then
    v_pattern := '%'
      || replace(replace(replace(v_query, E'\\', E'\\\\'), '%', E'\\%'), '_', E'\\_')
      || '%';
  end if;

  return query
  select
    e.id,
    e.event_id,
    e.occurred_at,
    e.event_code,
    e.category,
    e.result,
    e.summary,
    e.actor_user_id,
    e.actor_name,
    e.actor_role,
    e.target_type,
    e.target_id,
    e.target_label
  from private.audit_events e
  where (p_category is null or e.category = p_category)
    and (p_result is null or e.result = p_result)
    and (p_actor_id is null or e.actor_user_id = p_actor_id)
    and (p_from is null or e.occurred_at >= p_from)
    and (p_to is null or e.occurred_at <= p_to)
    and (
      v_query is null
      or (
        e.summary || ' ' || e.actor_name || ' ' || coalesce(e.target_label, '') || ' ' || e.event_code
      ) ilike v_pattern escape E'\\'
    )
    and (
      p_cursor_occurred_at is null
      or (e.occurred_at, e.id) < (p_cursor_occurred_at, p_cursor_id)
    )
  order by e.occurred_at desc, e.id desc
  limit v_limit + 1;
end;
$$;

revoke all on function public.list_admin_audit_events(text, text, uuid, text, timestamptz, timestamptz, timestamptz, bigint, integer)
  from public, anon, authenticated;
grant execute on function public.list_admin_audit_events(text, text, uuid, text, timestamptz, timestamptz, timestamptz, bigint, integer)
  to service_role;

create or replace function public.get_admin_audit_event(p_event_id uuid)
returns table (
  id bigint,
  event_id uuid,
  occurred_at timestamptz,
  event_code text,
  category text,
  result text,
  summary text,
  actor_user_id uuid,
  actor_name text,
  actor_role text,
  target_type text,
  target_id uuid,
  target_label text,
  changes jsonb,
  details jsonb,
  reason text,
  request_id uuid,
  source text,
  client_ip text,
  user_agent text,
  schema_version smallint
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    e.id,
    e.event_id,
    e.occurred_at,
    e.event_code,
    e.category,
    e.result,
    e.summary,
    e.actor_user_id,
    e.actor_name,
    e.actor_role,
    e.target_type,
    e.target_id,
    e.target_label,
    e.changes,
    e.details,
    e.reason,
    e.request_id,
    e.source,
    e.client_ip::text,
    e.user_agent,
    e.schema_version
  from private.audit_events e
  where e.event_id = p_event_id
  limit 1;
$$;

revoke all on function public.get_admin_audit_event(uuid) from public, anon, authenticated;
grant execute on function public.get_admin_audit_event(uuid) to service_role;

-- New account creation RPC with request/security context. The legacy six-arg
-- signature below remains as a compatibility wrapper during deployment.
create or replace function public.provision_admin_managed_profile(
  p_actor_id uuid,
  p_user_id uuid,
  p_email text,
  p_full_name text,
  p_phone text,
  p_role public.user_role,
  p_request_id uuid,
  p_client_ip text,
  p_user_agent text
)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor public.profiles;
  v_profile public.profiles;
  v_email text := lower(btrim(coalesce(p_email, '')));
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

  insert into public.profiles (
    id, email, full_name, phone, role, status,
    account_origin, onboarding_stage,
    onboarding_password_changed_at, onboarding_completed_at
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

  perform private.write_audit_event(
    'account.created',
    'accounts',
    'success',
    v_actor.full_name || ' created a ' || initcap(p_role::text) || ' account for ' || v_profile.full_name || '.',
    v_actor.id,
    v_actor.full_name,
    'admin',
    'account',
    v_profile.id,
    v_profile.full_name,
    '{}'::jsonb,
    jsonb_build_object(
      'email', v_profile.email,
      'role', v_profile.role::text,
      'account_origin', v_profile.account_origin::text,
      'onboarding_stage', v_profile.onboarding_stage::text
    ),
    null,
    p_request_id,
    'admin_dashboard',
    p_client_ip,
    p_user_agent
  );

  return v_profile;
end;
$$;

revoke all on function public.provision_admin_managed_profile(uuid, uuid, text, text, text, public.user_role, uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.provision_admin_managed_profile(uuid, uuid, text, text, text, public.user_role, uuid, text, text)
  to service_role;

create or replace function public.provision_admin_managed_profile(
  p_actor_id uuid,
  p_user_id uuid,
  p_email text,
  p_full_name text,
  p_phone text,
  p_role public.user_role
)
returns public.profiles
language sql
security definer
set search_path = ''
as $$
  select public.provision_admin_managed_profile(
    p_actor_id, p_user_id, p_email, p_full_name, p_phone, p_role,
    gen_random_uuid(), null, null
  );
$$;

revoke all on function public.provision_admin_managed_profile(uuid, uuid, text, text, text, public.user_role)
  from public, anon, authenticated;
grant execute on function public.provision_admin_managed_profile(uuid, uuid, text, text, text, public.user_role)
  to service_role;

create or replace function public.admin_update_managed_profile(
  p_actor_id uuid,
  p_target_id uuid,
  p_full_name text,
  p_phone text,
  p_status public.profile_status,
  p_request_id uuid,
  p_client_ip text,
  p_user_agent text
)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor public.profiles;
  v_before public.profiles;
  v_profile public.profiles;
  v_name text := btrim(coalesce(p_full_name, ''));
  v_phone text := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  v_changes jsonb := '{}'::jsonb;
  v_summary text;
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

  select * into v_before
  from public.profiles
  where id = p_target_id
  for update;

  if v_before.id is null then
    raise exception 'Account not found';
  end if;

  if v_before.deletion_reserved_at is not null then
    raise exception 'Account deletion is already in progress';
  end if;

  if v_before.role = 'admin'::public.user_role then
    raise exception 'Administrator accounts cannot be edited here';
  end if;

  if char_length(v_name) < 2 or char_length(v_name) > 60 or v_name ~ '[<>[:cntrl:]]' then
    raise exception 'Invalid profile data';
  end if;

  if v_before.role = 'customer'::public.user_role
     and v_before.onboarding_stage = 'complete'::public.onboarding_stage
     and v_phone !~ '^09[0-9]{9}$' then
    raise exception 'Customer phone is required';
  end if;

  if (
      v_before.role <> 'customer'::public.user_role
      or v_before.onboarding_stage <> 'complete'::public.onboarding_stage
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

  if v_before.full_name is distinct from v_profile.full_name then
    v_changes := v_changes || jsonb_build_object(
      'full_name', jsonb_build_object('before', v_before.full_name, 'after', v_profile.full_name)
    );
  end if;

  if v_before.phone is distinct from v_profile.phone then
    v_changes := v_changes || jsonb_build_object(
      'phone', jsonb_build_object(
        'before', private.mask_audit_phone(v_before.phone),
        'after', private.mask_audit_phone(v_profile.phone)
      )
    );
  end if;

  if v_before.status is distinct from v_profile.status then
    v_changes := v_changes || jsonb_build_object(
      'account_status', jsonb_build_object('before', v_before.status::text, 'after', v_profile.status::text)
    );
  end if;

  -- A save that does not change any tracked field is intentionally not logged.
  -- Activity History should stay meaningful instead of becoming a click stream.
  if v_changes = '{}'::jsonb then
    return v_profile;
  end if;

  if jsonb_object_length(v_changes) = 1 and v_changes ? 'account_status' then
    v_summary := v_actor.full_name || ' changed ' || v_profile.full_name || '''s account from '
      || initcap(v_before.status::text) || ' to ' || initcap(v_profile.status::text) || '.';
  else
    v_summary := v_actor.full_name || ' updated ' || v_profile.full_name || '''s account information.';
  end if;

  perform private.write_audit_event(
    'account.updated',
    'accounts',
    'success',
    v_summary,
    v_actor.id,
    v_actor.full_name,
    'admin',
    'account',
    v_profile.id,
    v_profile.full_name,
    v_changes,
    jsonb_build_object('role', v_profile.role::text, 'email', v_profile.email),
    null,
    p_request_id,
    'admin_dashboard',
    p_client_ip,
    p_user_agent
  );

  return v_profile;
end;
$$;

revoke all on function public.admin_update_managed_profile(uuid, uuid, text, text, public.profile_status, uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.admin_update_managed_profile(uuid, uuid, text, text, public.profile_status, uuid, text, text)
  to service_role;

create or replace function public.admin_update_managed_profile(
  p_actor_id uuid,
  p_target_id uuid,
  p_full_name text,
  p_phone text,
  p_status public.profile_status
)
returns public.profiles
language sql
security definer
set search_path = ''
as $$
  select public.admin_update_managed_profile(
    p_actor_id, p_target_id, p_full_name, p_phone, p_status,
    gen_random_uuid(), null, null
  );
$$;

revoke all on function public.admin_update_managed_profile(uuid, uuid, text, text, public.profile_status)
  from public, anon, authenticated;
grant execute on function public.admin_update_managed_profile(uuid, uuid, text, text, public.profile_status)
  to service_role;

-- Keep the old customer-specific RPC as a compatibility wrapper so no caller
-- can keep writing to the legacy audit table.
create or replace function public.admin_update_customer_profile(
  p_actor_id uuid,
  p_customer_id uuid,
  p_full_name text,
  p_phone text,
  p_status public.profile_status
)
returns public.profiles
language sql
security definer
set search_path = ''
as $$
  select public.admin_update_managed_profile(
    p_actor_id, p_customer_id, p_full_name, p_phone, p_status,
    gen_random_uuid(), null, null
  );
$$;

revoke all on function public.admin_update_customer_profile(uuid, uuid, text, text, public.profile_status)
  from public, anon, authenticated;
grant execute on function public.admin_update_customer_profile(uuid, uuid, text, text, public.profile_status)
  to service_role;

create or replace function public.advance_admin_managed_onboarding_password(
  p_user_id uuid,
  p_request_id uuid,
  p_client_ip text,
  p_user_agent text
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

    perform private.write_audit_event(
      'onboarding.password_replaced',
      'onboarding',
      'success',
      v_profile.full_name || ' replaced the temporary password during first-time setup.',
      v_profile.id,
      v_profile.full_name,
      v_profile.role::text,
      'account',
      v_profile.id,
      v_profile.full_name,
      jsonb_build_object(
        'setup_stage', jsonb_build_object('before', 'password_required', 'after', 'profile_required')
      ),
      jsonb_build_object('account_origin', v_profile.account_origin::text),
      null,
      p_request_id,
      'onboarding',
      p_client_ip,
      p_user_agent
    );
  elsif v_profile.onboarding_stage <> 'profile_required'::public.onboarding_stage then
    raise exception 'Password onboarding stage is already complete';
  end if;

  return v_profile;
end;
$$;

revoke all on function public.advance_admin_managed_onboarding_password(uuid, uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.advance_admin_managed_onboarding_password(uuid, uuid, text, text)
  to service_role;

create or replace function public.advance_admin_managed_onboarding_password(p_user_id uuid)
returns public.profiles
language sql
security definer
set search_path = ''
as $$
  select public.advance_admin_managed_onboarding_password(
    p_user_id, gen_random_uuid(), null, null
  );
$$;

revoke all on function public.advance_admin_managed_onboarding_password(uuid) from public, anon, authenticated;
grant execute on function public.advance_admin_managed_onboarding_password(uuid) to service_role;

create or replace function public.complete_admin_managed_onboarding(
  p_user_id uuid,
  p_full_name text,
  p_phone text,
  p_terms_version text,
  p_privacy_version text,
  p_request_id uuid,
  p_client_ip text,
  p_user_agent text
)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_before public.profiles;
  v_profile public.profiles;
  v_name text := btrim(coalesce(p_full_name, ''));
  v_phone text := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  v_changes jsonb := '{}'::jsonb;
begin
  select * into v_before
  from public.profiles
  where id = p_user_id
  for update;

  if v_before.id is null
     or v_before.status <> 'active'::public.profile_status
     or v_before.account_origin <> 'admin_managed'::public.account_origin
     or v_before.onboarding_stage <> 'profile_required'::public.onboarding_stage
     or v_before.onboarding_password_changed_at is null then
    raise exception 'Account is not ready to complete onboarding';
  end if;

  if char_length(v_name) < 2 or char_length(v_name) > 60 or v_name ~ '[<>[:cntrl:]]' then
    raise exception 'Invalid profile data';
  end if;

  if v_before.role = 'customer'::public.user_role then
    if v_phone !~ '^09[0-9]{9}$' then
      raise exception 'Customer phone is required';
    end if;

    if btrim(coalesce(p_terms_version, '')) <> '1.0'
       or btrim(coalesce(p_privacy_version, '')) <> '1.0' then
      raise exception 'Current customer agreement is required';
    end if;

    insert into public.legal_acceptances (
      user_id, terms_version, privacy_version, accepted_at, source
    )
    values (p_user_id, '1.0', '1.0', now(), 'admin_onboarding')
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

  if v_before.full_name is distinct from v_profile.full_name then
    v_changes := v_changes || jsonb_build_object(
      'full_name', jsonb_build_object('before', v_before.full_name, 'after', v_profile.full_name)
    );
  end if;

  if v_before.phone is distinct from v_profile.phone then
    v_changes := v_changes || jsonb_build_object(
      'phone', jsonb_build_object(
        'before', private.mask_audit_phone(v_before.phone),
        'after', private.mask_audit_phone(v_profile.phone)
      )
    );
  end if;

  v_changes := v_changes || jsonb_build_object(
    'setup_stage', jsonb_build_object('before', 'profile_required', 'after', 'complete')
  );

  perform private.write_audit_event(
    'onboarding.completed',
    'onboarding',
    'success',
    v_profile.full_name || ' completed first-time account setup.',
    v_profile.id,
    v_profile.full_name,
    v_profile.role::text,
    'account',
    v_profile.id,
    v_profile.full_name,
    v_changes,
    jsonb_strip_nulls(jsonb_build_object(
      'role', v_profile.role::text,
      'terms_version', case when v_profile.role = 'customer'::public.user_role then '1.0' else null end,
      'privacy_version', case when v_profile.role = 'customer'::public.user_role then '1.0' else null end
    )),
    null,
    p_request_id,
    'onboarding',
    p_client_ip,
    p_user_agent
  );

  return v_profile;
end;
$$;

revoke all on function public.complete_admin_managed_onboarding(uuid, text, text, text, text, uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.complete_admin_managed_onboarding(uuid, text, text, text, text, uuid, text, text)
  to service_role;

create or replace function public.complete_admin_managed_onboarding(
  p_user_id uuid,
  p_full_name text,
  p_phone text,
  p_terms_version text default null,
  p_privacy_version text default null
)
returns public.profiles
language sql
security definer
set search_path = ''
as $$
  select public.complete_admin_managed_onboarding(
    p_user_id, p_full_name, p_phone, p_terms_version, p_privacy_version,
    gen_random_uuid(), null, null
  );
$$;

revoke all on function public.complete_admin_managed_onboarding(uuid, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.complete_admin_managed_onboarding(uuid, text, text, text, text)
  to service_role;

create or replace function public.reserve_admin_account_deletion(
  p_actor_id uuid,
  p_target_id uuid,
  p_request_id uuid,
  p_client_ip text,
  p_user_agent text
)
returns table (
  target_user_id uuid,
  target_email text,
  target_name text,
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
  target_name := v_target.full_name;
  target_role := v_target.role;
  previous_status := v_target.status;

  update public.profiles
  set deletion_reserved_at = now(),
      deletion_reserved_by = p_actor_id
  where id = v_target.id;

  perform private.write_audit_event(
    'account.deletion_started',
    'accounts',
    'success',
    v_actor.full_name || ' started deleting ' || v_target.full_name || '''s ' || initcap(v_target.role::text) || ' account.',
    v_actor.id,
    v_actor.full_name,
    'admin',
    'account',
    v_target.id,
    v_target.full_name,
    '{}'::jsonb,
    jsonb_build_object('role', v_target.role::text, 'email', v_target.email),
    'Permanent account deletion was requested.',
    p_request_id,
    'admin_dashboard',
    p_client_ip,
    p_user_agent
  );

  return next;
end;
$$;

revoke all on function public.reserve_admin_account_deletion(uuid, uuid, uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.reserve_admin_account_deletion(uuid, uuid, uuid, text, text)
  to service_role;

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
language sql
security definer
set search_path = ''
as $$
  select r.target_user_id, r.target_email, r.target_role, r.previous_status
  from public.reserve_admin_account_deletion(
    p_actor_id, p_target_id, gen_random_uuid(), null, null
  ) r;
$$;

revoke all on function public.reserve_admin_account_deletion(uuid, uuid) from public, anon, authenticated;
grant execute on function public.reserve_admin_account_deletion(uuid, uuid) to service_role;

create or replace function public.restore_admin_account_deletion(
  p_actor_id uuid,
  p_target_id uuid,
  p_previous_status public.profile_status,
  p_request_id uuid,
  p_client_ip text,
  p_user_agent text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor public.profiles;
  v_target public.profiles;
begin
  select * into v_actor from public.profiles where id = p_actor_id;

  update public.profiles
  set deletion_reserved_at = null,
      deletion_reserved_by = null
  where id = p_target_id
    and deletion_reserved_by = p_actor_id
  returning * into v_target;

  if v_target.id is null then
    return false;
  end if;

  perform private.write_audit_event(
    'account.deletion_restored',
    'accounts',
    'success',
    'Deletion of ' || v_target.full_name || '''s ' || initcap(v_target.role::text) || ' account was stopped and the account was restored.',
    v_actor.id,
    coalesce(v_actor.full_name, 'Administrator'),
    'admin',
    'account',
    v_target.id,
    v_target.full_name,
    '{}'::jsonb,
    jsonb_build_object('role', v_target.role::text, 'email', v_target.email, 'previous_status', p_previous_status::text),
    'A reserved deletion did not complete, so the account reservation was cleared.',
    p_request_id,
    'admin_dashboard',
    p_client_ip,
    p_user_agent
  );

  return true;
end;
$$;

revoke all on function public.restore_admin_account_deletion(uuid, uuid, public.profile_status, uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.restore_admin_account_deletion(uuid, uuid, public.profile_status, uuid, text, text)
  to service_role;

create or replace function public.restore_admin_account_deletion(
  p_actor_id uuid,
  p_target_id uuid,
  p_previous_status public.profile_status
)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select public.restore_admin_account_deletion(
    p_actor_id, p_target_id, p_previous_status, gen_random_uuid(), null, null
  );
$$;

revoke all on function public.restore_admin_account_deletion(uuid, uuid, public.profile_status)
  from public, anon, authenticated;
grant execute on function public.restore_admin_account_deletion(uuid, uuid, public.profile_status)
  to service_role;

create or replace function public.record_admin_account_deleted(
  p_actor_id uuid,
  p_actor_name text,
  p_target_id uuid,
  p_target_email text,
  p_target_name text,
  p_target_role public.user_role,
  p_request_id uuid,
  p_client_ip text,
  p_user_agent text
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
     or char_length(btrim(coalesce(p_target_email, ''))) > 254
     or char_length(btrim(coalesce(p_actor_name, ''))) < 2
     or char_length(btrim(coalesce(p_target_name, ''))) < 2 then
    raise exception 'Invalid deletion audit data';
  end if;

  perform private.write_audit_event(
    'account.deleted',
    'accounts',
    'success',
    btrim(p_actor_name) || ' permanently deleted the ' || initcap(p_target_role::text) || ' account for ' || btrim(p_target_name) || '.',
    p_actor_id,
    btrim(p_actor_name),
    'admin',
    'account',
    p_target_id,
    btrim(p_target_name),
    '{}'::jsonb,
    jsonb_build_object('role', p_target_role::text, 'email', lower(btrim(p_target_email))),
    'The Supabase Auth user and linked application profile were permanently removed.',
    p_request_id,
    'admin_dashboard',
    p_client_ip,
    p_user_agent
  );
end;
$$;

revoke all on function public.record_admin_account_deleted(uuid, text, uuid, text, text, public.user_role, uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.record_admin_account_deleted(uuid, text, uuid, text, text, public.user_role, uuid, text, text)
  to service_role;

create or replace function public.record_admin_account_deleted(
  p_actor_id uuid,
  p_target_id uuid,
  p_target_email text,
  p_target_role public.user_role
)
returns void
language sql
security definer
set search_path = ''
as $$
  select public.record_admin_account_deleted(
    p_actor_id,
    coalesce((select p.full_name from public.profiles p where p.id = p_actor_id), 'Administrator'),
    p_target_id,
    p_target_email,
    coalesce((select p.full_name from public.profiles p where p.id = p_target_id), p_target_email),
    p_target_role,
    gen_random_uuid(),
    null,
    null
  );
$$;

revoke all on function public.record_admin_account_deleted(uuid, uuid, text, public.user_role)
  from public, anon, authenticated;
grant execute on function public.record_admin_account_deleted(uuid, uuid, text, public.user_role)
  to service_role;

create or replace function public.record_admin_account_deletion_failed(
  p_actor_id uuid,
  p_target_id uuid,
  p_request_id uuid,
  p_reason_code text,
  p_client_ip text,
  p_user_agent text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor public.profiles;
  v_target public.profiles;
  v_reason text;
begin
  select * into v_actor from public.profiles where id = p_actor_id;
  select * into v_target from public.profiles where id = p_target_id;

  if v_actor.id is null or v_actor.role <> 'admin'::public.user_role then
    raise exception 'Admin audit actor not found';
  end if;

  if v_target.id is null then
    raise exception 'Audit target not found';
  end if;

  v_reason := case p_reason_code
    when 'retained_files' then 'The account still owns retained files that must be reassigned or removed before deletion.'
    when 'auth_rejected' then 'Supabase Auth could not permanently remove the account.'
    when 'reservation_failed' then 'The account could not be safely reserved for deletion.'
    else 'The permanent account deletion could not be completed.'
  end;

  perform private.write_audit_event(
    'account.deletion_failed',
    'accounts',
    'failed',
    v_target.full_name || '''s account could not be permanently deleted. The account was kept available.',
    v_actor.id,
    v_actor.full_name,
    'admin',
    'account',
    v_target.id,
    v_target.full_name,
    '{}'::jsonb,
    jsonb_build_object('role', v_target.role::text, 'email', v_target.email, 'reason_code', p_reason_code),
    v_reason,
    p_request_id,
    'admin_dashboard',
    p_client_ip,
    p_user_agent
  );
end;
$$;

revoke all on function public.record_admin_account_deletion_failed(uuid, uuid, uuid, text, text, text)
  from public, anon, authenticated;
grant execute on function public.record_admin_account_deletion_failed(uuid, uuid, uuid, text, text, text)
  to service_role;

create or replace function public.record_admin_account_deletion_denied(
  p_actor_id uuid,
  p_target_id uuid,
  p_request_id uuid,
  p_reason_code text,
  p_client_ip text,
  p_user_agent text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor public.profiles;
  v_target public.profiles;
  v_reason text;
  v_target_label text;
  v_target_role text;
begin
  select * into v_actor from public.profiles where id = p_actor_id;
  select * into v_target from public.profiles where id = p_target_id;

  if v_actor.id is null or v_actor.role <> 'admin'::public.user_role then
    raise exception 'Admin audit actor not found';
  end if;

  v_target_label := coalesce(v_target.full_name, 'Unknown account');
  v_target_role := coalesce(v_target.role::text, 'unknown');

  v_reason := case p_reason_code
    when 'password_verification_failed' then 'The current Administrator password could not be verified.'
    when 'administrator_self_only' then 'Administrator accounts can only be deleted by their own account owner.'
    when 'last_active_admin' then 'The system must always keep at least one active, fully onboarded Administrator.'
    when 'confirmation_mismatch' then 'The confirmation email did not match the current Administrator account.'
    when 'deletion_in_progress' then 'Another deletion attempt is already in progress for this account.'
    when 'account_not_found' then 'The requested account could not be found.'
    else 'The deletion request did not pass the required safety checks.'
  end;

  perform private.write_audit_event(
    'account.deletion_denied',
    'security',
    'denied',
    v_actor.full_name || ' tried to delete ' || v_target_label || '''s account, but the request was denied.',
    v_actor.id,
    v_actor.full_name,
    'admin',
    'account',
    p_target_id,
    v_target_label,
    '{}'::jsonb,
    jsonb_build_object('role', v_target_role, 'reason_code', p_reason_code),
    v_reason,
    p_request_id,
    'admin_dashboard',
    p_client_ip,
    p_user_agent
  );
end;
$$;

revoke all on function public.record_admin_account_deletion_denied(uuid, uuid, uuid, text, text, text)
  from public, anon, authenticated;
grant execute on function public.record_admin_account_deletion_denied(uuid, uuid, uuid, text, text, text)
  to service_role;

-- Failure/denial writers below are service-role-only and deliberately accept
-- only predefined reason codes. They record business outcomes without storing
-- passwords, OTPs, tokens, or raw request bodies.
create or replace function public.record_admin_account_creation_failed(
  p_actor_id uuid,
  p_target_id uuid,
  p_target_email text,
  p_target_name text,
  p_target_role public.user_role,
  p_request_id uuid,
  p_reason_code text,
  p_client_ip text,
  p_user_agent text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor public.profiles;
  v_reason text;
begin
  select * into v_actor
  from public.profiles
  where id = p_actor_id
    and role = 'admin'::public.user_role
    and status = 'active'::public.profile_status
    and onboarding_stage = 'complete'::public.onboarding_stage;

  if v_actor.id is null then
    raise exception 'Admin audit actor not found';
  end if;

  if p_reason_code not in ('auth_rejected', 'profile_provision_failed', 'cleanup_failed') then
    raise exception 'Invalid account creation failure reason';
  end if;

  v_reason := case p_reason_code
    when 'auth_rejected' then 'Supabase Auth did not create the requested sign-in account.'
    when 'profile_provision_failed' then 'The sign-in account was created, but its application profile could not be completed and cleanup was attempted.'
    when 'cleanup_failed' then 'The application profile could not be completed and the temporary Auth account also could not be cleaned up automatically.'
  end;

  perform private.write_audit_event(
    'account.creation_failed',
    'accounts',
    'failed',
    v_actor.full_name || ' could not create the ' || initcap(p_target_role::text) || ' account for ' || btrim(p_target_name) || '.',
    v_actor.id,
    v_actor.full_name,
    'admin',
    'account',
    p_target_id,
    btrim(p_target_name),
    '{}'::jsonb,
    jsonb_build_object(
      'email', lower(btrim(p_target_email)),
      'role', p_target_role::text,
      'reason_code', p_reason_code
    ),
    v_reason,
    p_request_id,
    'admin_dashboard',
    p_client_ip,
    p_user_agent
  );
end;
$$;

revoke all on function public.record_admin_account_creation_failed(uuid, uuid, text, text, public.user_role, uuid, text, text, text)
  from public, anon, authenticated;
grant execute on function public.record_admin_account_creation_failed(uuid, uuid, text, text, public.user_role, uuid, text, text, text)
  to service_role;

create or replace function public.record_onboarding_password_replacement_denied(
  p_user_id uuid,
  p_request_id uuid,
  p_client_ip text,
  p_user_agent text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile public.profiles;
begin
  select * into v_profile
  from public.profiles
  where id = p_user_id;

  if v_profile.id is null
     or v_profile.status <> 'active'::public.profile_status
     or v_profile.account_origin <> 'admin_managed'::public.account_origin
     or v_profile.onboarding_stage <> 'password_required'::public.onboarding_stage then
    raise exception 'Account is not eligible for onboarding audit';
  end if;

  perform private.write_audit_event(
    'onboarding.password_replacement_denied',
    'security',
    'denied',
    v_profile.full_name || ' could not replace the temporary password during first-time setup.',
    v_profile.id,
    v_profile.full_name,
    v_profile.role::text,
    'account',
    v_profile.id,
    v_profile.full_name,
    '{}'::jsonb,
    jsonb_build_object('setup_stage', v_profile.onboarding_stage::text),
    'The temporary password could not be verified or Supabase Auth rejected the replacement.',
    p_request_id,
    'onboarding',
    p_client_ip,
    p_user_agent
  );
end;
$$;

revoke all on function public.record_onboarding_password_replacement_denied(uuid, uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.record_onboarding_password_replacement_denied(uuid, uuid, text, text)
  to service_role;

-- Password recovery controls are intentionally separate from the general admin
-- limiter. Recovery identifiers are HMAC digests generated server-side, not
-- email addresses or IP addresses, and the table has a transaction-safe cap.
create table public.password_recovery_rate_limits (
  rate_key text primary key,
  window_started_at timestamptz not null,
  request_count integer not null check (request_count > 0),
  updated_at timestamptz not null default now(),
  constraint password_recovery_rate_limits_key_format check (
    rate_key ~ '^password-recovery:(email|ip|session):[A-Za-z0-9_-]{43}$'
  )
);

alter table public.password_recovery_rate_limits enable row level security;
revoke all on table public.password_recovery_rate_limits from public, anon, authenticated;

create or replace function public.consume_password_recovery_rate_limit(
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
  v_window interval;
  v_window_started_at timestamptz;
  v_request_count integer;
  v_existing boolean;
begin
  if p_key is null or p_key !~ '^password-recovery:(email|ip|session):[A-Za-z0-9_-]{43}$' then
    raise exception 'Invalid password recovery rate-limit key';
  end if;
  if p_limit < 1 or p_limit > 100 then
    raise exception 'Invalid password recovery rate limit';
  end if;
  if p_window_seconds < 60 or p_window_seconds > 86400 then
    raise exception 'Invalid password recovery rate-limit window';
  end if;

  -- Serializes the bounded cleanup/count/insert sequence. Password recovery is
  -- intentionally low-throughput, so this trades a small amount of contention
  -- for a hard cardinality bound under adversarial requests.
  perform pg_advisory_xact_lock(642741219);
  v_window := make_interval(secs => p_window_seconds);

  delete from public.password_recovery_rate_limits
  where window_started_at + v_window <= now();

  select exists (
    select 1 from public.password_recovery_rate_limits where rate_key = p_key
  ) into v_existing;

  if not v_existing and (select count(*) from public.password_recovery_rate_limits) >= 20000 then
    allowed := false;
    retry_after_seconds := 60;
    return next;
    return;
  end if;

  insert into public.password_recovery_rate_limits (
    rate_key, window_started_at, request_count, updated_at
  ) values (p_key, now(), 1, now())
  on conflict (rate_key) do update
  set
    window_started_at = case
      when public.password_recovery_rate_limits.window_started_at + v_window <= now() then now()
      else public.password_recovery_rate_limits.window_started_at
    end,
    request_count = case
      when public.password_recovery_rate_limits.window_started_at + v_window <= now() then 1
      else public.password_recovery_rate_limits.request_count + 1
    end,
    updated_at = now()
  returning window_started_at, request_count into v_window_started_at, v_request_count;

  allowed := v_request_count <= p_limit;
  retry_after_seconds := case
    when allowed then 0
    else greatest(1, ceil(extract(epoch from (v_window_started_at + v_window - now())))::integer)
  end;
  return next;
end;
$$;

revoke all on function public.consume_password_recovery_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_password_recovery_rate_limit(text, integer, integer)
  to service_role;

-- A recovery session is stored under its verified Supabase `session_id`, never
-- under an access/refresh token. Active and revocation-pending rows are not
-- time-pruned. Only a globally signed-out session whose access JWT has passed
-- its verified expiry can be removed, preventing a 10-minute intent expiry
-- from silently releasing application restrictions.
create table public.password_recovery_sessions (
  session_id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  state text not null default 'active' check (
    state in ('active', 'revocation_pending', 'revoked_waiting_for_access_expiry')
  ),
  access_expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.password_recovery_sessions enable row level security;
revoke all on table public.password_recovery_sessions from public, anon, authenticated;
grant select, insert, update, delete on table public.password_recovery_sessions to service_role;

create or replace function public.register_password_recovery_session(
  p_session_id uuid,
  p_user_id uuid,
  p_access_expires_at timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing boolean;
begin
  if p_session_id is null or p_user_id is null or p_access_expires_at <= now() then
    raise exception 'Invalid password recovery session';
  end if;

  perform pg_advisory_xact_lock(642741220);

  -- This is the only automatic cleanup: a global sign-out has already
  -- happened and the access JWT is no longer cryptographically valid.
  delete from public.password_recovery_sessions
  where state = 'revoked_waiting_for_access_expiry'
    and access_expires_at <= now();

  select exists (
    select 1 from public.password_recovery_sessions where session_id = p_session_id
  ) into v_existing;

  if not v_existing and (select count(*) from public.password_recovery_sessions) >= 20000 then
    return false;
  end if;

  insert into public.password_recovery_sessions (
    session_id, user_id, state, access_expires_at, created_at, updated_at
  ) values (
    p_session_id, p_user_id, 'active', p_access_expires_at, now(), now()
  )
  on conflict (session_id) do update
  set
    user_id = excluded.user_id,
    state = 'active',
    access_expires_at = excluded.access_expires_at,
    updated_at = now();

  return true;
end;
$$;

revoke all on function public.register_password_recovery_session(uuid, uuid, timestamptz)
  from public, anon, authenticated;
grant execute on function public.register_password_recovery_session(uuid, uuid, timestamptz)
  to service_role;

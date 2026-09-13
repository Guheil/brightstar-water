-- Administrator-managed GCash destination settings with order-time snapshots.
-- Normal browser roles do not read or write this table directly. Server routes
-- return only the minimum safe DTO required by the Admin or Customer UI.

create table if not exists public.payment_settings (
  method text primary key check (method = 'gcash'),
  enabled boolean not null default false,
  recipient_name text null check (
    recipient_name is null
    or (char_length(btrim(recipient_name)) between 2 and 100 and recipient_name !~ '[<>[:cntrl:]]')
  ),
  account_number text null check (account_number is null or account_number ~ '^09[0-9]{9}$'),
  qr_path text null check (qr_path is null or qr_path ~ '^gcash/[0-9a-f-]{36}[.]webp$'),
  version bigint not null default 1 check (version >= 1),
  updated_by uuid null references public.profiles(id) on update cascade on delete set null,
  updated_at timestamptz not null default now(),
  constraint payment_settings_gcash_enabled_destination check (
    enabled = false
    or (
      recipient_name is not null
      and btrim(recipient_name) <> ''
      and (account_number is not null or qr_path is not null)
    )
  )
);

insert into public.payment_settings(method, enabled, version)
values ('gcash', false, 1)
on conflict (method) do nothing;

alter table public.payment_settings enable row level security;
revoke all on table public.payment_settings from public, anon, authenticated;
grant select, insert, update on table public.payment_settings to service_role;

-- Historical orders created before this migration can legitimately have null
-- snapshot fields. New GCash orders created through the wrapper RPC below always
-- receive a complete settings snapshot.
alter table public.payments add column if not exists gcash_settings_version bigint null;
alter table public.payments add column if not exists gcash_recipient_name text null;
alter table public.payments add column if not exists gcash_account_number text null;
alter table public.payments add column if not exists gcash_qr_path text null;

alter table public.payments drop constraint if exists payments_gcash_settings_version_check;
alter table public.payments add constraint payments_gcash_settings_version_check
  check (gcash_settings_version is null or gcash_settings_version >= 1);

alter table public.payments drop constraint if exists payments_gcash_recipient_name_check;
alter table public.payments add constraint payments_gcash_recipient_name_check
  check (
    gcash_recipient_name is null
    or (char_length(btrim(gcash_recipient_name)) between 2 and 100 and gcash_recipient_name !~ '[<>[:cntrl:]]')
  );

alter table public.payments drop constraint if exists payments_gcash_account_number_check;
alter table public.payments add constraint payments_gcash_account_number_check
  check (gcash_account_number is null or gcash_account_number ~ '^09[0-9]{9}$');

alter table public.payments drop constraint if exists payments_gcash_qr_path_check;
alter table public.payments add constraint payments_gcash_qr_path_check
  check (gcash_qr_path is null or gcash_qr_path ~ '^gcash/[0-9a-f-]{36}[.]webp$');

alter table public.payments drop constraint if exists payments_cod_has_no_gcash_snapshot;
alter table public.payments add constraint payments_cod_has_no_gcash_snapshot
  check (
    method <> 'cod'
    or (
      gcash_settings_version is null
      and gcash_recipient_name is null
      and gcash_account_number is null
      and gcash_qr_path is null
    )
  );

create or replace function public.admin_update_gcash_payment_settings(
  p_actor_id uuid,
  p_enabled boolean,
  p_recipient_name text,
  p_account_number text,
  p_qr_path text,
  p_expected_version bigint,
  p_request_id uuid,
  p_client_ip text default null,
  p_user_agent text default null
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor public.profiles;
  v_before public.payment_settings;
  v_recipient text;
  v_account text;
  v_next_version bigint;
begin
  v_actor := private.assert_operational_actor(p_actor_id, 'admin'::public.user_role);
  if p_request_id is null then raise exception 'Invalid request'; end if;

  select * into v_before
  from public.payment_settings
  where method = 'gcash'
  for update;
  if not found then raise exception 'GCash payment settings are unavailable'; end if;

  if p_expected_version is null or p_expected_version <> v_before.version then
    raise exception 'Payment settings changed. Reload the page and try again';
  end if;

  v_recipient := nullif(btrim(coalesce(p_recipient_name, '')), '');
  v_account := nullif(btrim(coalesce(p_account_number, '')), '');

  if v_recipient is not null and (
    char_length(v_recipient) < 2
    or char_length(v_recipient) > 100
    or v_recipient ~ '[<>[:cntrl:]]'
  ) then
    raise exception 'Invalid GCash recipient name';
  end if;

  if v_account is not null and v_account !~ '^09[0-9]{9}$' then
    raise exception 'Invalid GCash account number';
  end if;

  if p_qr_path is not null and p_qr_path !~ '^gcash/[0-9a-f-]{36}[.]webp$' then
    raise exception 'Invalid GCash QR path';
  end if;

  if p_enabled and (v_recipient is null or (v_account is null and p_qr_path is null)) then
    raise exception 'GCash requires a recipient name and a payment number or QR code';
  end if;

  v_next_version := v_before.version + 1;

  update public.payment_settings
  set enabled = p_enabled,
      recipient_name = v_recipient,
      account_number = v_account,
      qr_path = p_qr_path,
      version = v_next_version,
      updated_by = p_actor_id,
      updated_at = now()
  where method = 'gcash';

  perform private.write_audit_event(
    'payment_settings.gcash_updated',
    'payments',
    'success',
    v_actor.full_name || ' updated GCash payment settings.',
    p_actor_id,
    v_actor.full_name,
    'admin',
    'payment',
    null,
    'GCash settings',
    jsonb_build_object(
      'enabled', jsonb_build_object('from', v_before.enabled, 'to', p_enabled),
      'has_account_number', jsonb_build_object('from', v_before.account_number is not null, 'to', v_account is not null),
      'has_qr_code', jsonb_build_object('from', v_before.qr_path is not null, 'to', p_qr_path is not null)
    ),
    jsonb_build_object('version', v_next_version),
    null,
    p_request_id,
    'admin_portal',
    p_client_ip,
    p_user_agent
  );

  return v_next_version;
end;
$$;

revoke all on function public.admin_update_gcash_payment_settings(uuid,boolean,text,text,text,bigint,uuid,text,text)
  from public, anon, authenticated;
grant execute on function public.admin_update_gcash_payment_settings(uuid,boolean,text,text,text,bigint,uuid,text,text)
  to service_role;

-- Wrapper around the existing order transaction. It keeps the proven order RPC
-- unchanged while adding an atomic lock/version check and a settings snapshot for
-- GCash orders. The shared lock prevents an Admin settings update from committing
-- between the customer's version check and order creation.
create or replace function public.customer_place_order_with_payment_settings(
  p_actor_id uuid,
  p_items jsonb,
  p_address_id uuid,
  p_schedule jsonb,
  p_payment_method text,
  p_payment_proof_path text,
  p_gcash_settings_version bigint,
  p_customer_note text,
  p_idempotency_key uuid,
  p_request_id uuid,
  p_client_ip text default null,
  p_user_agent text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing uuid;
  v_order_id uuid;
  v_settings public.payment_settings;
begin
  perform private.assert_operational_actor(p_actor_id, 'customer'::public.user_role);
  if p_request_id is null or p_idempotency_key is null then raise exception 'Invalid request'; end if;

  -- Preserve the existing idempotency contract even if payment settings changed
  -- after the first successful submission.
  select id into v_existing
  from public.orders
  where customer_id = p_actor_id and idempotency_key = p_idempotency_key;
  if found then return v_existing; end if;

  if p_payment_method = 'gcash' then
    select * into v_settings
    from public.payment_settings
    where method = 'gcash'
    for share;

    if not found
       or v_settings.enabled = false
       or v_settings.recipient_name is null
       or (v_settings.account_number is null and v_settings.qr_path is null) then
      raise exception 'GCash is currently unavailable. Choose cash on delivery';
    end if;

    if p_gcash_settings_version is null or p_gcash_settings_version <> v_settings.version then
      raise exception 'GCash payment details were updated. Review the current payment information before continuing';
    end if;
  elsif p_payment_method = 'cod' then
    if p_gcash_settings_version is not null then raise exception 'Invalid GCash settings version'; end if;
  else
    raise exception 'Invalid payment method';
  end if;

  v_order_id := public.customer_place_order(
    p_actor_id,
    p_items,
    p_address_id,
    p_schedule,
    p_payment_method,
    p_payment_proof_path,
    p_customer_note,
    p_idempotency_key,
    p_request_id,
    p_client_ip,
    p_user_agent
  );

  if p_payment_method = 'gcash' then
    update public.payments
    set gcash_settings_version = v_settings.version,
        gcash_recipient_name = v_settings.recipient_name,
        gcash_account_number = v_settings.account_number,
        gcash_qr_path = v_settings.qr_path
    where order_id = v_order_id and method = 'gcash';
  end if;

  return v_order_id;
end;
$$;

revoke all on function public.customer_place_order_with_payment_settings(uuid,jsonb,uuid,jsonb,text,text,bigint,text,uuid,uuid,text,text)
  from public, anon, authenticated;
grant execute on function public.customer_place_order_with_payment_settings(uuid,jsonb,uuid,jsonb,text,text,bigint,text,uuid,uuid,text,text)
  to service_role;

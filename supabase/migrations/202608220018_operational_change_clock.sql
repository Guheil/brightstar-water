-- Cheap cross-role synchronization clock. The server polls one row and only
-- reloads operational data when an order-related mutation advances the clock.
create table if not exists public.operational_change_clock (
  id boolean primary key default true check (id = true),
  version bigint not null default 1 check (version > 0),
  updated_at timestamptz not null default now()
);
insert into public.operational_change_clock(id, version, updated_at)
values(true, 1, now())
on conflict(id) do nothing;

alter table public.operational_change_clock enable row level security;
revoke all on table public.operational_change_clock from public, anon, authenticated;
grant select, update on table public.operational_change_clock to service_role;

create or replace function private.bump_operational_change_clock()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.operational_change_clock
  set version = version + 1, updated_at = clock_timestamp()
  where id = true;
  return null;
end;
$$;
revoke all on function private.bump_operational_change_clock() from public, anon, authenticated, service_role;

do $$
declare
  v_table text;
  v_trigger text;
begin
  foreach v_table in array array[
    'orders','order_items','payments','deliveries','order_events','order_cancellations',
    'refunds','order_inventory_reservations','loyalty_accounts','loyalty_activity'
  ] loop
    v_trigger := 'operational_clock_' || v_table;
    execute format('drop trigger if exists %I on public.%I', v_trigger, v_table);
    execute format(
      'create trigger %I after insert or update or delete on public.%I for each statement execute function private.bump_operational_change_clock()',
      v_trigger, v_table
    );
  end loop;
end $$;

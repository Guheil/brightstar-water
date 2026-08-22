-- Persist Admin loyalty corrections now that delivery completion awards points in Postgres.
create or replace function public.admin_adjust_customer_loyalty(
  p_actor_id uuid,
  p_customer_id uuid,
  p_points_delta integer,
  p_reason text,
  p_request_id uuid,
  p_client_ip text default null,
  p_user_agent text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor public.profiles;
  v_customer public.profiles;
  v_reason text;
  v_current integer := 0;
  v_next integer;
begin
  v_actor := private.assert_operational_actor(p_actor_id, 'admin'::public.user_role);
  select * into v_customer from public.profiles where id=p_customer_id and role='customer'::public.user_role for share;
  if not found then raise exception 'Customer not found'; end if;
  if p_points_delta=0 or abs(p_points_delta)>100000 then raise exception 'Invalid loyalty adjustment'; end if;
  v_reason := private.order_clean_text(p_reason,500);
  if v_reason is null or char_length(v_reason)<4 then raise exception 'Loyalty adjustment reason is required'; end if;

  perform pg_advisory_xact_lock(hashtextextended(p_customer_id::text, 84322));
  select points_available into v_current from public.loyalty_accounts where customer_id=p_customer_id for update;
  if not found then v_current:=0; end if;
  v_next:=v_current+p_points_delta;
  if v_next<0 then raise exception 'Loyalty points cannot fall below zero'; end if;

  insert into public.loyalty_accounts(customer_id,points_available,updated_at)
  values(p_customer_id,v_next,now())
  on conflict(customer_id) do update set points_available=excluded.points_available,updated_at=now();
  insert into public.loyalty_activity(customer_id,activity_type,points,description,reason)
  values(
    p_customer_id,
    case when p_points_delta>0 then 'manual_credit' else 'manual_debit' end,
    abs(p_points_delta),
    'Admin ' || case when p_points_delta>0 then 'added ' else 'deducted ' end || abs(p_points_delta)::text || ' points.',
    v_reason
  );
  perform private.write_audit_event(
    'loyalty.adjusted','loyalty','success',v_actor.full_name || ' adjusted loyalty points for ' || v_customer.full_name || '.',
    p_actor_id,v_actor.full_name,'admin','loyalty',p_customer_id,v_customer.full_name,
    jsonb_build_object('before',v_current,'after',v_next,'delta',p_points_delta),'{}'::jsonb,v_reason,
    p_request_id,'admin_portal',p_client_ip,p_user_agent
  );
end;
$$;
revoke all on function public.admin_adjust_customer_loyalty(uuid,uuid,integer,text,uuid,text,text) from public,anon,authenticated;
grant execute on function public.admin_adjust_customer_loyalty(uuid,uuid,integer,text,uuid,text,text) to service_role;

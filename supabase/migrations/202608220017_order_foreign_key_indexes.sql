-- Cover operational foreign keys used for referential maintenance and reverse lookups.
create index if not exists deliveries_completion_actor_idx on public.deliveries (completion_recorded_by) where completion_recorded_by is not null;
create index if not exists deliveries_failure_actor_idx on public.deliveries (failure_reported_by) where failure_reported_by is not null;
create index if not exists loyalty_activity_order_idx on public.loyalty_activity (order_id) where order_id is not null;
create index if not exists order_cancellations_requester_idx on public.order_cancellations (requested_by);
create index if not exists order_cancellations_reviewer_idx on public.order_cancellations (reviewed_by) where reviewed_by is not null;
create index if not exists order_events_actor_idx on public.order_events (actor_id) where actor_id is not null;
create index if not exists order_items_product_idx on public.order_items (product_id);
create index if not exists orders_delivery_address_idx on public.orders (delivery_address_id) where delivery_address_id is not null;
create index if not exists refunds_payment_idx on public.refunds (payment_id);

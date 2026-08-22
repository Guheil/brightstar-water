-- Post-deployment advisor fixes for the Product catalog.
-- Supports profile-linked adjustment history lookups and FK maintenance.
create index if not exists inventory_adjustments_actor_time_idx
  on public.inventory_adjustments (actor_id, created_at desc)
  where actor_id is not null;

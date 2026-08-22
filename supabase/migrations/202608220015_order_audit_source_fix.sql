-- Extend the existing audit source vocabulary for the operational portals introduced by Orders + Delivery.
alter table private.audit_events drop constraint if exists audit_events_source;
alter table private.audit_events add constraint audit_events_source check (
  source in ('admin_dashboard','admin_portal','onboarding','customer_portal','deliverer_app','deliverer_portal','system')
);

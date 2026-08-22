-- Keep Admin-managed first-login profiles intentionally incomplete until the
-- user has replaced the temporary password and completed required details.
alter table public.profiles alter column onboarding_completed_at drop not null;
alter table public.profiles alter column onboarding_completed_at drop default;

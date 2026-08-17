-- Support the Admin contains-search over contact numbers without a full scan.
create index if not exists profiles_phone_trgm_idx
  on public.profiles using gin (phone extensions.gin_trgm_ops);

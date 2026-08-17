-- Phase 1 authentication schema for MRJE Gas + Bright Star Water.
-- Run this migration once in the Supabase SQL editor or with the Supabase CLI.

create type public.user_role as enum ('customer', 'admin', 'deliverer');
create type public.profile_status as enum ('active', 'inactive');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  phone text not null,
  role public.user_role not null default 'customer',
  status public.profile_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_email_length check (char_length(email) between 3 and 254),
  constraint profiles_full_name_length check (char_length(btrim(full_name)) between 2 and 60),
  constraint profiles_full_name_trimmed check (full_name = btrim(full_name)),
  constraint profiles_full_name_plain_text check (full_name !~ '[<>[:cntrl:]]'),
  constraint profiles_phone_ph check (phone ~ '^09[0-9]{9}$')
);

create unique index profiles_email_normalized_idx on public.profiles (lower(email));
create index profiles_role_status_idx on public.profiles (role, status);

alter table public.profiles enable row level security;

-- Supabase projects can have broad default grants on public schema objects.
-- Reset them explicitly so authenticated users cannot INSERT, DELETE, or
-- update privileged columns such as role/status through the Data API.
revoke all privileges on table public.profiles from anon, authenticated;

-- The publishable key can only read a profile when there is an authenticated
-- user whose auth.uid() matches the row. Anonymous users receive no rows.
grant select on public.profiles to authenticated;

-- Customers may edit only their own non-privileged profile fields. Role and
-- status are intentionally excluded from UPDATE privileges.
grant update (full_name, phone) on public.profiles to authenticated;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  normalized_name text;
  normalized_phone text;
begin
  normalized_name := btrim(coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  normalized_phone := regexp_replace(coalesce(new.raw_user_meta_data ->> 'phone', ''), '[^0-9]', '', 'g');

  if char_length(normalized_name) < 2
     or char_length(normalized_name) > 60
     or normalized_name ~ '[<>[:cntrl:]]' then
    raise exception 'Invalid registration profile data';
  end if;

  if normalized_phone !~ '^09[0-9]{9}$' then
    raise exception 'Invalid registration profile data';
  end if;

  insert into public.profiles (id, email, full_name, phone, role, status)
  values (
    new.id,
    lower(btrim(coalesce(new.email, ''))),
    normalized_name,
    normalized_phone,
    'customer'::public.user_role,
    'active'::public.profile_status
  );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.set_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_profile_updated_at();

comment on table public.profiles is
  'Application-facing profile data. Credentials and verified identity remain in Supabase Auth.';
comment on column public.profiles.role is
  'Privileged field. Public signup is always customer; users cannot update this column through the Data API.';

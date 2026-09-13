-- Keep the application profile login email aligned with Supabase Auth.
-- Auth remains the source of truth for login identity.

create or replace function public.sync_profile_email_from_auth()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is distinct from old.email
     and new.email is not null
     and btrim(new.email) <> '' then
    update public.profiles
    set email = lower(btrim(new.email))
    where id = new.id;
  end if;

  return new;
end;
$$;

revoke all on function public.sync_profile_email_from_auth() from public;
revoke all on function public.sync_profile_email_from_auth() from anon;
revoke all on function public.sync_profile_email_from_auth() from authenticated;

drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
after update of email on auth.users
for each row
when (old.email is distinct from new.email)
execute procedure public.sync_profile_email_from_auth();

comment on function public.sync_profile_email_from_auth() is
  'Trigger-only helper that mirrors a Supabase Auth login-email change into public.profiles.';

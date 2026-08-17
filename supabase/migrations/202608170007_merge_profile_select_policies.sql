-- Keep one SELECT policy so each profile row evaluates one permissive policy.

drop policy if exists "profiles_admin_select_all" on public.profiles;
drop policy if exists "profiles_select_own" on public.profiles;

create policy "profiles_select_own_or_admin"
on public.profiles
for select
to authenticated
using (
  (select auth.uid()) = id
  or (select private.is_active_admin())
);

-- Customer accounts require a delivery contact number. Admin and Deliverer
-- profiles may be provisioned before a phone number is available.

alter table public.profiles drop constraint if exists profiles_phone_ph;

alter table public.profiles
add constraint profiles_phone_ph check (
  (role = 'customer'::public.user_role and phone ~ '^09[0-9]{9}$')
  or
  (role in ('admin'::public.user_role, 'deliverer'::public.user_role)
    and (phone = '' or phone ~ '^09[0-9]{9}$'))
);

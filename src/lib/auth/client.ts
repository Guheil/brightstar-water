import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { replaceCustomerCart } from '@/lib/cart/client';
import { useAppStore } from '@/store';
import type { AuthSession } from '@/types';
import { createAppAuthSession } from './session';
import { profileCanAccessApplication, type SupabaseProfile } from './types';

export async function loadCurrentAppSession(
  suppliedClient?: SupabaseClient,
): Promise<{ session: AuthSession | null; profile: SupabaseProfile | null }> {
  const supabase = suppliedClient ?? createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData.user;

  if (userError || !user) return { session: null, profile: null };

  const { data, error } = await supabase
    .from('profiles')
    .select('id,email,full_name,phone,role,status,account_origin,onboarding_stage,onboarding_password_changed_at,onboarding_completed_at,created_at,updated_at')
    .eq('id', user.id)
    .single();

  if (error || !data) return { session: null, profile: null };

  const profile = data as SupabaseProfile;
  if (!profileCanAccessApplication(profile)) return { session: null, profile };

  return { session: createAppAuthSession(user, profile), profile };
}

export async function signOutCurrentUser(): Promise<void> {
  const state = useAppStore.getState();
  const customerId = state.auth.session?.user.role === 'customer'
    ? state.auth.session.user.customerId ?? null
    : null;

  if (customerId && state.cart.initialized && state.cart.ownerCustomerId === customerId) {
    // Flush the latest cart before invalidating the auth cookie. This closes the
    // race where a user adds an item and immediately logs out before the normal
    // debounced persistence effect has fired.
    await replaceCustomerCart(state.cart.items).catch(() => undefined);
  }

  const supabase = createClient();
  await supabase.auth.signOut({ scope: 'local' });
}

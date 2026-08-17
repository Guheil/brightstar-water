import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import type { AuthSession } from '@/types';
import { createAppAuthSession } from './session';
import type { SupabaseProfile } from './types';

export async function loadCurrentAppSession(
  suppliedClient?: SupabaseClient,
): Promise<{ session: AuthSession | null; profile: SupabaseProfile | null }> {
  const supabase = suppliedClient ?? createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData.user;

  if (userError || !user) return { session: null, profile: null };

  const { data, error } = await supabase
    .from('profiles')
    .select('id,email,full_name,phone,role,status,created_at,updated_at')
    .eq('id', user.id)
    .single();

  if (error || !data) return { session: null, profile: null };

  const profile = data as SupabaseProfile;
  if (profile.status !== 'active') return { session: null, profile };

  return { session: createAppAuthSession(user, profile), profile };
}

export async function signOutCurrentUser(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut({ scope: 'local' });
}

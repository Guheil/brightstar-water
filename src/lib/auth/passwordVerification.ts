import 'server-only';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getSupabasePublicConfig } from '@/lib/supabase/config';

export async function verifyPasswordForEmail(email: string, password: string): Promise<boolean> {
  const { publishableKey, url } = getSupabasePublicConfig();
  const verifier = createSupabaseClient(url, publishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  const { data, error } = await verifier.auth.signInWithPassword({
    email,
    password,
  });

  const verified = !error && data.user?.email?.toLowerCase() === email.toLowerCase();

  if (data.session) {
    await verifier.auth.signOut({ scope: 'local' });
  }

  return verified;
}

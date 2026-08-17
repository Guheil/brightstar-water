import 'server-only';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getSupabasePublicConfig } from './config';

function getAdminCredential(): string {
  const credential =
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!credential) {
    throw new Error(
      'Missing server-only Supabase admin credential. Set SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY.',
    );
  }

  return credential;
}

export function createAdminClient() {
  const { url } = getSupabasePublicConfig();

  return createSupabaseClient(url, getAdminCredential(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export async function consumeAdminRateLimit(
  adminClient: SupabaseClient,
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const { data, error } = await adminClient.rpc('consume_admin_api_rate_limit', {
    p_key: key,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });

  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : data;
  return {
    allowed: Boolean(row?.allowed),
    retryAfterSeconds: Number(row?.retry_after_seconds ?? 0),
  };
}

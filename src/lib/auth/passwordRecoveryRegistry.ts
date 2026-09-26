import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { RecoveryIdentity } from './passwordRecovery';

export type PasswordRecoverySessionState =
  | 'active'
  | 'revocation_pending'
  | 'revoked_waiting_for_access_expiry';

export interface PasswordRecoverySessionRecord {
  access_expires_at: string;
  session_id: string;
  state: PasswordRecoverySessionState;
  user_id: string;
}

export async function registerPasswordRecoverySession(
  adminClient: SupabaseClient,
  identity: RecoveryIdentity,
): Promise<boolean> {
  const { data, error } = await adminClient.rpc('register_password_recovery_session', {
    p_access_expires_at: identity.accessExpiresAt.toISOString(),
    p_session_id: identity.sessionId,
    p_user_id: identity.userId,
  });

  if (error) throw error;
  return data === true;
}

export async function getPasswordRecoverySession(
  adminClient: SupabaseClient,
  identity: Pick<RecoveryIdentity, 'sessionId' | 'userId'>,
): Promise<PasswordRecoverySessionRecord | null> {
  const { data, error } = await adminClient
    .from('password_recovery_sessions')
    .select('session_id,user_id,state,access_expires_at')
    .eq('session_id', identity.sessionId)
    .eq('user_id', identity.userId)
    .maybeSingle();

  if (error) throw error;
  return (data as PasswordRecoverySessionRecord | null) ?? null;
}

export async function touchPasswordRecoverySession(
  adminClient: SupabaseClient,
  identity: RecoveryIdentity,
): Promise<void> {
  const { error } = await adminClient
    .from('password_recovery_sessions')
    .update({ access_expires_at: identity.accessExpiresAt.toISOString(), updated_at: new Date().toISOString() })
    .eq('session_id', identity.sessionId)
    .eq('user_id', identity.userId)
    .eq('state', 'active');

  if (error) throw error;
}

export async function markPasswordRecoverySession(
  adminClient: SupabaseClient,
  identity: RecoveryIdentity,
  state: Exclude<PasswordRecoverySessionState, 'active'>,
): Promise<void> {
  const { error } = await adminClient
    .from('password_recovery_sessions')
    .update({
      access_expires_at: identity.accessExpiresAt.toISOString(),
      state,
      updated_at: new Date().toISOString(),
    })
    .eq('session_id', identity.sessionId)
    .eq('user_id', identity.userId);

  if (error) throw error;
}

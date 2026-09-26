import 'server-only';

import { cookies } from 'next/headers';
import { verifyPasswordRecoveryIntent, type RecoveryIdentity } from './passwordRecovery';
import { getPasswordRecoverySession } from './passwordRecoveryRegistry';
import { createAdminClient } from '@/lib/supabase/admin';
import { createRecoveryServerClient, getVerifiedRecoveryIdentity } from '@/lib/supabase/recovery';

export async function getActivePasswordRecoveryContext(): Promise<RecoveryIdentity | null> {
  try {
    const supabase = await createRecoveryServerClient();
    const identity = await getVerifiedRecoveryIdentity(supabase);
    if (!identity) return null;

    const cookieStore = await cookies();
    if (!verifyPasswordRecoveryIntent(cookieStore.get('mrje-password-recovery-intent')?.value, identity)) {
      return null;
    }

    const session = await getPasswordRecoverySession(createAdminClient(), identity);
    return session?.state === 'active' ? identity : null;
  } catch {
    // A recovery page must fail closed if intent, verified claims, or the
    // server-only registry cannot be checked.
    return null;
  }
}

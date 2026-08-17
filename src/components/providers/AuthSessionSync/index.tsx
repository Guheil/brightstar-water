'use client';

import { useEffect, useMemo } from 'react';
import { loadCurrentAppSession } from '@/lib/auth/client';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/store';
import { AuthSessionBoundary } from './elements';
import type { AuthSessionSyncProps } from './interface';

export default function AuthSessionSync({ children }: AuthSessionSyncProps) {
  const supabase = useMemo(() => createClient(), []);
  const syncAuthSession = useAppStore((state) => state.commands.syncAuthSession);
  const clearAuthSession = useAppStore((state) => state.commands.signOut);

  useEffect(() => {
    let active = true;

    const sync = async () => {
      const result = await loadCurrentAppSession(supabase);
      if (!active) return;
      if (result.session) {
        syncAuthSession({ session: result.session, phone: result.profile?.phone });
      } else {
        syncAuthSession({ session: null });
      }
    };

    void sync();

    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (!active) return;
      if (event === 'SIGNED_OUT') {
        clearAuthSession();
        return;
      }
      window.setTimeout(() => {
        if (active) void sync();
      }, 0);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [clearAuthSession, supabase, syncAuthSession]);

  return <AuthSessionBoundary>{children}</AuthSessionBoundary>;
}

'use client';

import { useEffect, useMemo, useRef } from 'react';
import { loadCurrentAppSession } from '@/lib/auth/client';
import { fetchCustomerAddresses } from '@/lib/addresses/client';
import { fetchCustomerCart, replaceCustomerCart } from '@/lib/cart/client';
import { createClient } from '@/lib/supabase/client';
import { fetchOperationalSnapshot, fetchOperationalVersion } from '@/lib/orders/client';
import { useAppStore } from '@/store';
import { AuthSessionBoundary } from './elements';
import type { AuthSessionSyncProps } from './interface';

export default function AuthSessionSync({ children }: AuthSessionSyncProps) {
  const supabase = useMemo(() => createClient(), []);
  const syncAuthSession = useAppStore((state) => state.commands.syncAuthSession);
  const clearAuthSession = useAppStore((state) => state.commands.signOut);
  const syncCustomerAddresses = useAppStore((state) => state.commands.syncCustomerAddresses);
  const syncCustomerCart = useAppStore((state) => state.commands.syncCustomerCart);
  const markCustomerCartFailed = useAppStore((state) => state.commands.markCustomerCartFailed);
  const syncOperationalSnapshot = useAppStore((state) => state.commands.syncOperationalSnapshot);
  const markCustomerAddressesFailed = useAppStore((state) => state.commands.markCustomerAddressesFailed);
  const operationalVersionRef = useRef<number | null>(null);
  const persistedCartRef = useRef<{ customerId: string; fingerprint: string } | null>(null);
  const cartItems = useAppStore((state) => state.cart.items);
  const cartOwnerCustomerId = useAppStore((state) => state.cart.ownerCustomerId);
  const cartInitialized = useAppStore((state) => state.cart.initialized);
  const activeCustomerId = useAppStore((state) =>
    state.auth.session?.user.role === 'customer' ? state.auth.session.user.customerId ?? null : null,
  );

  useEffect(() => {
    let active = true;

    const sync = async () => {
      const result = await loadCurrentAppSession(supabase);
      if (!active) return;
      if (result.session) {
        syncAuthSession({ session: result.session, phone: result.profile?.phone });
        if (result.session.user.role === 'customer' && result.session.user.customerId) {
          const customerId = result.session.user.customerId;
          const [addressesResult, cartResult] = await Promise.allSettled([
            fetchCustomerAddresses(),
            fetchCustomerCart(),
          ]);
          if (active) {
            if (addressesResult.status === 'fulfilled') syncCustomerAddresses(customerId, addressesResult.value);
            else markCustomerAddressesFailed('Saved delivery addresses could not be loaded.');

            if (cartResult.status === 'fulfilled') {
              const fingerprint = JSON.stringify([...cartResult.value].sort((a, b) => a.productId.localeCompare(b.productId)));
              persistedCartRef.current = { customerId, fingerprint };
              syncCustomerCart(customerId, cartResult.value);
            } else {
              persistedCartRef.current = null;
              markCustomerCartFailed(customerId, 'Your saved cart could not be loaded. New changes will retry automatically.');
            }
          }
        } else {
          persistedCartRef.current = null;
        }
        try {
          const [operations, version] = await Promise.all([
            fetchOperationalSnapshot(),
            fetchOperationalVersion().catch(() => null),
          ]);
          if (active) {
            syncOperationalSnapshot(operations);
            if (version) operationalVersionRef.current = version.version;
          }
        } catch {
          // Role shells remain usable if operational data is temporarily unavailable.
        }
      } else {
        syncAuthSession({ session: null });
      }
    };

    void sync();

    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (!active) return;
      if (event === 'SIGNED_OUT') {
        operationalVersionRef.current = null;
        persistedCartRef.current = null;
        clearAuthSession();
        return;
      }
      window.setTimeout(() => {
        if (active) void sync();
      }, 0);
    });

    const pollOperations = async () => {
      if (!active || document.visibilityState !== 'visible') return;
      try {
        const version = await fetchOperationalVersion();
        if (!active) return;
        if (operationalVersionRef.current == null) {
          operationalVersionRef.current = version.version;
          return;
        }
        if (version.version === operationalVersionRef.current) return;
        const snapshot = await fetchOperationalSnapshot();
        if (!active) return;
        operationalVersionRef.current = version.version;
        syncOperationalSnapshot(snapshot);
      } catch {
        // Keep the last good snapshot; the next visible poll retries automatically.
      }
    };

    const pollId = window.setInterval(() => void pollOperations(), 20_000);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') void pollOperations();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      active = false;
      window.clearInterval(pollId);
      document.removeEventListener('visibilitychange', handleVisibility);
      subscription.subscription.unsubscribe();
    };
  }, [clearAuthSession, markCustomerAddressesFailed, markCustomerCartFailed, supabase, syncAuthSession, syncCustomerAddresses, syncCustomerCart, syncOperationalSnapshot]);

  useEffect(() => {
    if (!activeCustomerId || !cartInitialized || cartOwnerCustomerId !== activeCustomerId) return;

    const snapshot = cartItems.map((item) => ({ ...item }));
    const fingerprint = JSON.stringify([...snapshot].sort((a, b) => a.productId.localeCompare(b.productId)));
    if (persistedCartRef.current?.customerId === activeCustomerId && persistedCartRef.current.fingerprint === fingerprint) return;

    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      void replaceCustomerCart(snapshot)
        .then(() => {
          if (cancelled) return;
          persistedCartRef.current = { customerId: activeCustomerId, fingerprint };
          syncCustomerCart(activeCustomerId, snapshot);
        })
        .catch(() => {
          if (!cancelled) {
            markCustomerCartFailed(activeCustomerId, 'Your cart could not be saved yet. It will retry after your next cart change.');
          }
        });
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [activeCustomerId, cartInitialized, cartItems, cartOwnerCustomerId, markCustomerCartFailed, syncCustomerCart]);

  return <AuthSessionBoundary>{children}</AuthSessionBoundary>;
}

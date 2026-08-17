import type { User } from '@supabase/supabase-js';
import type { AuthSession } from '@/types';
import type { SupabaseProfile } from './types';

export const ROLE_DESTINATIONS = {
  customer: '/customer/account',
  admin: '/admin/overview',
  deliverer: '/deliverer',
} as const;

export function createAppAuthSession(user: User, profile: SupabaseProfile): AuthSession {
  return {
    user: {
      id: user.id,
      role: profile.role,
      displayName: profile.full_name,
      email: profile.email || user.email || '',
      ...(profile.role === 'customer' ? { customerId: profile.id } : {}),
      ...(profile.role === 'deliverer' ? { delivererId: profile.id } : {}),
    },
    signedInAt: user.last_sign_in_at ?? new Date().toISOString(),
  };
}

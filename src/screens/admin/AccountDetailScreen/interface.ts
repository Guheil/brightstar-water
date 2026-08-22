import type { SupabaseProfile } from '@/lib/auth/types';

export interface AccountDetailScreenProps {
  account: SupabaseProfile | null;
}

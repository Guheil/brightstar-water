import type { SupabaseProfile } from '@/lib/auth/types';

export interface CustomerDetailScreenProps {
  customer: SupabaseProfile | null;
}

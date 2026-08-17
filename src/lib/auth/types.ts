import type { UserRole } from '@/types';

export type ProfileStatus = 'active' | 'inactive';

export interface SupabaseProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  status: ProfileStatus;
  created_at: string;
  updated_at: string;
}

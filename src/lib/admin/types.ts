import type { SupabaseProfile } from '@/lib/auth/types';
import type { ProfileStatus } from '@/lib/auth/types';
import type { UserRole } from '@/types';

export type AdminManagedProfile = SupabaseProfile;

export interface AdminProfileListFilters {
  page: number;
  query: string;
  role?: UserRole;
  status?: ProfileStatus;
}

export interface AdminProfileListResult {
  activeCount: number;
  adminCount: number;
  customerCount: number;
  delivererCount: number;
  inactiveCount: number;
  page: number;
  pageCount: number;
  profiles: AdminManagedProfile[];
  totalCount: number;
}

export interface CreateManagedAccountInput {
  email: string;
  fullName: string;
  password: string;
  phone: string;
  role: UserRole;
}

export interface UpdateCustomerProfileInput {
  fullName: string;
  phone: string;
  status: ProfileStatus;
}

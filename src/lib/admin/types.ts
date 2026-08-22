import type {
  OnboardingStage,
  ProfileStatus,
  SupabaseProfile,
} from '@/lib/auth/types';
import type { UserRole } from '@/types';

export type AdminManagedProfile = SupabaseProfile;

export interface AdminProfileListFilters {
  page: number;
  query: string;
  role?: UserRole;
  setup?: OnboardingStage;
  status?: ProfileStatus;
}

export interface AdminProfileListResult {
  activeAdminCount: number;
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

export interface UpdateManagedProfileInput {
  fullName: string;
  phone: string;
  status: ProfileStatus;
}

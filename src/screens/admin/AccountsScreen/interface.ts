import type { ProfileStatus } from '@/lib/auth/types';
import type { AdminProfileListResult } from '@/lib/admin/types';
import type { UserRole } from '@/types';

export interface AccountsScreenProps {
  className?: string;
  filters: {
    page: number;
    query: string;
    role?: UserRole;
    status?: ProfileStatus;
  };
  initialData: AdminProfileListResult;
}

export type AccountRoleFilter = 'all' | UserRole;
export type AccountStatusFilter = 'all' | ProfileStatus;

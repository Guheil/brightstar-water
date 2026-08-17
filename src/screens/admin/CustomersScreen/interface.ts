import type { ProfileStatus } from '@/lib/auth/types';
import type { AdminProfileListResult } from '@/lib/admin/types';

export interface CustomersScreenProps {
  className?: string;
  filters: {
    page: number;
    query: string;
    status?: ProfileStatus;
  };
  initialData: AdminProfileListResult;
}

export type CustomerStatusFilter = 'all' | ProfileStatus;

import type {
  OnboardingStage,
  ProfileStatus,
} from '@/lib/auth/types';
import type { AdminProfileListResult } from '@/lib/admin/types';
import type { UserRole } from '@/types';

export interface AccountsScreenProps {
  className?: string;
  currentActorId: string;
  filters: {
    page: number;
    query: string;
    role?: UserRole;
    setup?: OnboardingStage;
    status?: ProfileStatus;
  };
  initialData: AdminProfileListResult;
}

export type AccountRoleFilter = 'all' | UserRole;
export type AccountSetupFilter = 'all' | OnboardingStage;
export type AccountStatusFilter = 'all' | ProfileStatus;

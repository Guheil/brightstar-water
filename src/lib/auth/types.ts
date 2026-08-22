import type { UserRole } from '@/types';

export type ProfileStatus = 'active' | 'inactive';
export type AccountOrigin = 'self_registered' | 'admin_managed';
export type OnboardingStage = 'password_required' | 'profile_required' | 'complete';

export interface SupabaseProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  status: ProfileStatus;
  account_origin: AccountOrigin;
  onboarding_stage: OnboardingStage;
  onboarding_password_changed_at: string | null;
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const profileRequiresOnboarding = (profile: SupabaseProfile): boolean =>
  profile.account_origin === 'admin_managed' && profile.onboarding_stage !== 'complete';

export const profileCanAccessApplication = (profile: SupabaseProfile): boolean =>
  profile.status === 'active' && profile.onboarding_stage === 'complete';

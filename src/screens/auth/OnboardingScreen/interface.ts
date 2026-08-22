import type { SupabaseProfile } from '@/lib/auth/types';

export interface OnboardingScreenProps {
  profile: SupabaseProfile;
}

export interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileFormValues {
  fullName: string;
  phone: string;
}

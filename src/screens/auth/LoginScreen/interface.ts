import type { UserRole } from '@/types';

export interface LoginScreenProps {
  nextPath?: string;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface DemoAccessAccount {
  email: string;
  label: string;
  password: string;
  role: UserRole;
}

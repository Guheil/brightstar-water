export interface RegisterScreenProps {
  nextPath?: string;
}

export type RegistrationStage = 'details' | 'security' | 'agreement' | 'verify';

export interface RegisterFormValues {
  displayName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface RegistrationStepProps {
  $active: boolean;
  $complete: boolean;
}

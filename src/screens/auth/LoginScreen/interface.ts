export interface LoginScreenProps {
  emailChanged?: boolean;
  nextPath?: string;
  passwordReset?: boolean;
  recoveryNotice?: boolean;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface ProfileFormValues {
  displayName: string;
  phone: string;
}

export interface ProfileFeedback {
  message: string;
  title: string;
  tone: 'success' | 'error';
}

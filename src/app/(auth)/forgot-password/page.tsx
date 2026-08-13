import type { Metadata } from 'next';
import ForgotPasswordScreen from '@/screens/auth/ForgotPasswordScreen';

export const metadata: Metadata = {
  title: 'Password recovery',
  description: 'Request help signing back in to your account.',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordScreen />;
}

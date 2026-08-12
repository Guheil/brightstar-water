import type { Metadata } from 'next';
import ForgotPasswordScreen from '@/screens/auth/ForgotPasswordScreen';

export const metadata: Metadata = {
  title: 'Demo password recovery',
  description:
    'Demonstrate password recovery without sending email or changing a real credential.',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordScreen />;
}

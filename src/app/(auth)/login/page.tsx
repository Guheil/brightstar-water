import type { Metadata } from 'next';
import LoginScreen from '@/screens/auth/LoginScreen';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to manage orders, deliveries, and account activity.',
};

export default function LoginPage() {
  return <LoginScreen />;
}

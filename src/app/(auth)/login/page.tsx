import type { Metadata } from 'next';
import LoginScreen from '@/screens/auth/LoginScreen';

export const metadata: Metadata = {
  title: 'Prototype sign in',
  description: 'Sign in with a fixed fictional presentation account.',
};

export default function LoginPage() {
  return <LoginScreen />;
}

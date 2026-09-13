import type { Metadata } from 'next';
import LoginScreen from '@/screens/auth/LoginScreen';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to manage orders, deliveries, and account activity.',
};

interface LoginPageProps {
  searchParams: Promise<{ emailChanged?: string; next?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { emailChanged, next } = await searchParams;
  return <LoginScreen emailChanged={emailChanged === '1'} nextPath={next} />;
}

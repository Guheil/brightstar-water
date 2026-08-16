import type { Metadata } from 'next';
import LoginScreen from '@/screens/auth/LoginScreen';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to manage orders, deliveries, and account activity.',
};

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;
  return <LoginScreen nextPath={next} />;
}

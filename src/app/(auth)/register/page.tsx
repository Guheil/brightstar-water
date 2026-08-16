import type { Metadata } from 'next';
import RegisterScreen from '@/screens/auth/RegisterScreen';

export const metadata: Metadata = {
  title: 'Create a customer account',
  description: 'Create a customer account for ordering and delivery management.',
};

interface RegisterPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { next } = await searchParams;
  return <RegisterScreen nextPath={next} />;
}

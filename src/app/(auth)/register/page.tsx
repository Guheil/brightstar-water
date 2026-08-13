import type { Metadata } from 'next';
import RegisterScreen from '@/screens/auth/RegisterScreen';

export const metadata: Metadata = {
  title: 'Create a customer account',
  description: 'Create a customer account for ordering and delivery management.',
};

export default function RegisterPage() {
  return <RegisterScreen />;
}

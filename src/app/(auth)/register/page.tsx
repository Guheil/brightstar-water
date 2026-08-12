import type { Metadata } from 'next';
import RegisterScreen from '@/screens/auth/RegisterScreen';

export const metadata: Metadata = {
  title: 'Demo customer registration',
  description:
    'Demonstrate customer registration using fictional, non-persistent details.',
};

export default function RegisterPage() {
  return <RegisterScreen />;
}

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import ResetPasswordScreen from '@/screens/auth/ResetPasswordScreen';
import { getActivePasswordRecoveryContext } from '@/lib/auth/passwordRecoveryContext';

export const metadata: Metadata = {
  title: 'Create a new password',
  description: 'Finish your secure password recovery request.',
};

export default async function ResetPasswordPage() {
  const recovery = await getActivePasswordRecoveryContext();
  if (!recovery) redirect('/forgot-password?recovery=invalid');

  return <ResetPasswordScreen />;
}

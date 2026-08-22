import { redirect } from 'next/navigation';
import { managedAccountIdSchema } from '@/lib/admin/validation';

interface CustomerDetailRedirectPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailRedirectPage({ params }: CustomerDetailRedirectPageProps) {
  const { id } = await params;
  const parsed = managedAccountIdSchema.safeParse(id);
  redirect(parsed.success ? `/admin/accounts/${parsed.data}` : '/admin/accounts?role=customer');
}

import { getManagedProfile } from '@/lib/admin/server';
import AccountDetailScreen from '@/screens/admin/AccountDetailScreen';

interface AccountDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AccountDetailPage({ params }: AccountDetailPageProps) {
  const { id } = await params;
  const account = await getManagedProfile(id);
  return <AccountDetailScreen account={account} />;
}

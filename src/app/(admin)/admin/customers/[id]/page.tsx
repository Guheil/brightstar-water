import { getCustomerProfile } from '@/lib/admin/server';
import CustomerDetailScreen from '@/screens/admin/CustomerDetailScreen';

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params;
  const customer = await getCustomerProfile(id);
  return <CustomerDetailScreen customer={customer} />;
}

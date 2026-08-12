import OrderDetailScreen from '@/screens/customer/OrderDetailScreen';

export default async function CustomerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderDetailScreen orderId={id} />;
}


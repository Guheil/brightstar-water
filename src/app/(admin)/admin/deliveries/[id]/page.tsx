import DeliveryDetailScreen from '@/screens/admin/DeliveryDetailScreen';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DeliveryDetailScreen deliveryId={id} />;
}

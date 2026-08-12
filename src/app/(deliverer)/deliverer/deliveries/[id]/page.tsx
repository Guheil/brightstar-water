import DeliveryDetailScreen from '@/screens/deliverer/DeliveryDetailScreen';

interface DeliveryDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DeliveryDetailPage({
  params,
}: DeliveryDetailPageProps) {
  const { id } = await params;
  return <DeliveryDetailScreen deliveryId={id} />;
}

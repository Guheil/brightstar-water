import OrderConfirmationScreen from '@/screens/customer/OrderConfirmationScreen';

export default async function CustomerOrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderConfirmationScreen orderId={id} />;
}


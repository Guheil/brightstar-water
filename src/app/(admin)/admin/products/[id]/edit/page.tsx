import ProductFormScreen from '@/screens/admin/ProductFormScreen';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductFormScreen productId={id} />;
}

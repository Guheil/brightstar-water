import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getPublicProduct } from '@/lib/catalog/server';
import ProductDetailScreen from '@/screens/public/ProductDetailScreen';

interface MrjeProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: MrjeProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const record = await getPublicProduct(id);
  const product = record?.product;
  return {
    title: product?.category === 'gas' ? product.name : 'MRJE product unavailable',
    description: product?.category === 'gas' ? product.shortDescription : 'The requested MRJE Gas product could not be found.',
  };
}

export default async function MrjeProductPage({ params }: MrjeProductPageProps) {
  const { id } = await params;
  const record = await getPublicProduct(id);
  if (record?.product.category === 'water') redirect(`/brightstar/product/${record.product.id}`);

  return (
    <ProductDetailScreen
      deliveryHref="/mrje/delivery"
      expectedCategory="gas"
      initialInventory={record?.inventory ?? null}
      initialProduct={record?.product ?? null}
      productId={id}
      shopHref="/mrje/shop"
    />
  );
}

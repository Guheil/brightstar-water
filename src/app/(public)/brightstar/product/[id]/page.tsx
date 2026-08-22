import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getPublicProduct } from '@/lib/catalog/server';
import ProductDetailScreen from '@/screens/public/ProductDetailScreen';

interface BrightStarProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: BrightStarProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const record = await getPublicProduct(id);
  const product = record?.product;
  return {
    title: product?.category === 'water' ? product.name : 'Bright Star product unavailable',
    description: product?.category === 'water' ? product.shortDescription : 'The requested Bright Star Water product could not be found.',
  };
}

export default async function BrightStarProductPage({ params }: BrightStarProductPageProps) {
  const { id } = await params;
  const record = await getPublicProduct(id);
  if (record?.product.category === 'gas') redirect(`/mrje/product/${record.product.id}`);

  return (
    <ProductDetailScreen
      deliveryHref="/brightstar/delivery"
      expectedCategory="water"
      initialInventory={record?.inventory ?? null}
      initialProduct={record?.product ?? null}
      productId={id}
      shopHref="/brightstar/shop"
    />
  );
}

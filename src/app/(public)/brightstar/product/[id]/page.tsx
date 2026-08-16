import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PRODUCT_DATA } from '@/data';
import ProductDetailScreen from '@/screens/public/ProductDetailScreen';

interface BrightStarProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: BrightStarProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = PRODUCT_DATA.find(
    (item) => item.id === id || item.slug === id,
  );

  return {
    title:
      product?.category === 'water'
        ? product.name
        : 'Bright Star product unavailable',
    description:
      product?.category === 'water'
        ? product.shortDescription
        : 'The requested Bright Star Water product could not be found.',
  };
}

export default async function BrightStarProductPage({
  params,
}: BrightStarProductPageProps) {
  const { id } = await params;
  const product = PRODUCT_DATA.find(
    (item) => item.id === id || item.slug === id,
  );

  if (product?.category === 'gas') {
    redirect(`/mrje/product/${product.id}`);
  }

  return (
    <ProductDetailScreen
      deliveryHref="/brightstar/delivery"
      expectedCategory="water"
      productId={id}
      shopHref="/brightstar/shop"
    />
  );
}

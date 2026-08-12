import type { Metadata } from 'next';
import { PRODUCT_FIXTURES } from '@/mocks';
import ProductDetailScreen from '@/screens/public/ProductDetailScreen';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = PRODUCT_FIXTURES.find(
    (item) => item.id === id || item.slug === id,
  );

  return {
    title: product?.name ?? 'Product unavailable',
    description:
      product?.shortDescription ??
      'The requested fictional catalog product could not be found.',
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  return <ProductDetailScreen productId={id} />;
}

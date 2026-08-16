import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PRODUCT_DATA } from '@/data';
import ProductDetailScreen from '@/screens/public/ProductDetailScreen';

interface MrjeProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: MrjeProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = PRODUCT_DATA.find(
    (item) => item.id === id || item.slug === id,
  );

  return {
    title: product?.category === 'gas' ? product.name : 'MRJE product unavailable',
    description:
      product?.category === 'gas'
        ? product.shortDescription
        : 'The requested MRJE Gas product could not be found.',
  };
}

export default async function MrjeProductPage({ params }: MrjeProductPageProps) {
  const { id } = await params;
  const product = PRODUCT_DATA.find(
    (item) => item.id === id || item.slug === id,
  );

  if (product?.category === 'water') {
    redirect(`/brightstar/product/${product.id}`);
  }

  return (
    <ProductDetailScreen
      deliveryHref="/mrje/delivery"
      expectedCategory="gas"
      productId={id}
      shopHref="/mrje/shop"
    />
  );
}

import { redirect } from 'next/navigation';
import { getProductStorefrontPath } from '@/config';
import { PRODUCT_FIXTURES } from '@/mocks';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = PRODUCT_FIXTURES.find(
    (item) => item.id === id || item.slug === id,
  );

  if (!product) {
    redirect('/');
  }

  redirect(getProductStorefrontPath(product.category, product.id));
}

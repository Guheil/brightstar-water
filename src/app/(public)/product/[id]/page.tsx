import { redirect } from 'next/navigation';
import { getProductStorefrontPath } from '@/config';
import { getPublicProduct } from '@/lib/catalog/server';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const record = await getPublicProduct(id);
  if (!record) {
    redirect('/');
    return null;
  }
  redirect(getProductStorefrontPath(record.product.category, record.product.id));
  return null;
}

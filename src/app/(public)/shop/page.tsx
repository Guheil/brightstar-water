import { redirect } from 'next/navigation';

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    q?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category, q } = await searchParams;
  const query = q ? `?q=${encodeURIComponent(q)}` : '';

  if (category === 'water') {
    redirect(`/brightstar/shop${query}`);
  }

  if (category === 'gas') {
    redirect(`/mrje/shop${query}`);
  }

  redirect('/');
}

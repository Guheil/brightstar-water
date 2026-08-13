import type { Metadata } from 'next';
import ShopScreen from '@/screens/public/ShopScreen';

export const metadata: Metadata = {
  title: 'Shop',
  description:
    'Browse available LPG refills, purified water, and household accessories.',
};

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    q?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category, q } = await searchParams;
  return (
    <ShopScreen
      initialCategory={category}
      initialQuery={q}
      key={`${category ?? 'all'}:${q ?? ''}`}
    />
  );
}

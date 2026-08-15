import type { Metadata } from 'next';
import ShopScreen from '@/screens/public/ShopScreen';

export const metadata: Metadata = {
  title: 'Shop Bright Star Water',
  description:
    'Browse Bright Star purified water refills, containers, and water accessories.',
};

interface BrightStarShopPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function BrightStarShopPage({
  searchParams,
}: BrightStarShopPageProps) {
  const { q } = await searchParams;
  return (
    <ShopScreen
      coverageHref="/brightstar/delivery"
      initialQuery={q}
      introduction="Browse Bright Star purified water refills, containers, and household water accessories. Current availability is shown for every product."
      lockedCategory="water"
      productHrefPrefix="/brightstar/product"
      title="Shop Bright Star Water"
    />
  );
}

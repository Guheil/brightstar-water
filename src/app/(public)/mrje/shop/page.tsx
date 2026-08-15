import type { Metadata } from 'next';
import ShopScreen from '@/screens/public/ShopScreen';

export const metadata: Metadata = {
  title: 'Shop MRJE Gas',
  description: 'Browse available MRJE LPG refills and compatible gas accessories.',
};

interface MrjeShopPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function MrjeShopPage({ searchParams }: MrjeShopPageProps) {
  const { q } = await searchParams;
  return (
    <ShopScreen
      coverageHref="/mrje/delivery"
      initialQuery={q}
      introduction="Browse MRJE LPG refills and compatible gas accessories. Current availability is shown for every product."
      lockedCategory="gas"
      productHrefPrefix="/mrje/product"
      title="Shop MRJE Gas"
    />
  );
}

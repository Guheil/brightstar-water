import type { Metadata } from 'next';
import BrightStarHomeScreen from '@/screens/public/BrightStarHomeScreen';

export const metadata: Metadata = {
  title: 'Bright Star Water',
  description:
    'Browse Bright Star purified water refills, containers, and accessories for scheduled local delivery in San Pedro, Laguna.',
};

export default function BrightStarPage() {
  return <BrightStarHomeScreen />;
}

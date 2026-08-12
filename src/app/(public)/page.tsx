import type { Metadata } from 'next';
import HomeScreen from '@/screens/public/HomeScreen';

export const metadata: Metadata = {
  title: 'Local LPG and water delivery',
  description:
    'Browse LPG and purified water for scheduled delivery in the MRJE Gas and Bright Star Water frontend prototype.',
};

export default function Page() {
  return <HomeScreen />;
}

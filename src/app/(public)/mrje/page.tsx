import type { Metadata } from 'next';
import MrjeHomeScreen from '@/screens/public/MrjeHomeScreen';

export const metadata: Metadata = {
  title: 'MRJE Gas',
  description:
    'Browse MRJE household LPG refills and gas accessories for scheduled local delivery in San Pedro, Laguna.',
};

export default function MrjePage() {
  return <MrjeHomeScreen />;
}

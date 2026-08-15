import type { Metadata } from 'next';
import DeliveryInfoScreen from '@/screens/public/DeliveryInfoScreen';

export const metadata: Metadata = {
  title: 'MRJE Gas delivery coverage',
  description: 'Review MRJE Gas delivery zones, fees, scheduling, and payment options.',
};

export default function MrjeDeliveryPage() {
  return <DeliveryInfoScreen shopHref="/mrje/shop" storefrontName="MRJE Gas" />;
}

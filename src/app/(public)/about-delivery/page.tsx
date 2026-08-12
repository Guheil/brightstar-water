import type { Metadata } from 'next';
import DeliveryInfoScreen from '@/screens/public/DeliveryInfoScreen';

export const metadata: Metadata = {
  title: 'Delivery coverage',
  description:
    'Review fictional delivery zones, fees, scheduling, COD, and the non-production GCash demonstration.',
};

export default function DeliveryInfoPage() {
  return <DeliveryInfoScreen />;
}

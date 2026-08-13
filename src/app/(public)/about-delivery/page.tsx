import type { Metadata } from 'next';
import DeliveryInfoScreen from '@/screens/public/DeliveryInfoScreen';

export const metadata: Metadata = {
  title: 'Delivery coverage',
  description:
    'Review delivery zones, fees, scheduling, cash on delivery, and GCash payment information.',
};

export default function DeliveryInfoPage() {
  return <DeliveryInfoScreen />;
}

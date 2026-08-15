import type { Metadata } from 'next';
import DeliveryInfoScreen from '@/screens/public/DeliveryInfoScreen';

export const metadata: Metadata = {
  title: 'Bright Star Water delivery coverage',
  description:
    'Review Bright Star Water delivery zones, fees, scheduling, and payment options.',
};

export default function BrightStarDeliveryPage() {
  return (
    <DeliveryInfoScreen
      shopHref="/brightstar/shop"
      storefrontName="Bright Star Water"
    />
  );
}

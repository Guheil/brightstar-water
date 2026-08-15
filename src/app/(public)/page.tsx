import type { Metadata } from 'next';
import ServiceGatewayScreen from '@/screens/public/ServiceGatewayScreen';

export const metadata: Metadata = {
  title: 'Choose MRJE Gas or Bright Star Water',
  description:
    'Choose MRJE Gas for LPG delivery or Bright Star Water for purified water delivery from one connected local ordering platform.',
};

export default function Page() {
  return <ServiceGatewayScreen />;
}

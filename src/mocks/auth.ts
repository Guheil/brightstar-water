import type { DemoAuthAccount } from '@/types';

export const DEMO_AUTH_ACCOUNTS: DemoAuthAccount[] = [
  {
    id: 'user-customer-demo',
    role: 'customer',
    displayName: 'Maya Santos',
    email: 'customer@brightstar.local',
    customerId: 'customer-demo-01',
    demoPassword: 'BrightStar123!',
  },
  {
    id: 'user-admin-demo',
    role: 'admin',
    displayName: 'Store Administrator',
    email: 'admin@brightstar.local',
    demoPassword: 'BrightStar123!',
  },
  {
    id: 'user-deliverer-demo',
    role: 'deliverer',
    displayName: 'Daniel Cruz',
    email: 'deliverer@brightstar.local',
    delivererId: 'deliverer-demo-01',
    demoPassword: 'BrightStar123!',
  },
];

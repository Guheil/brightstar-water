import type { AuthAccount } from '@/types';

export const DEMO_AUTH_ACCOUNTS: AuthAccount[] = [
  {
    id: 'user-customer-demo',
    role: 'customer',
    displayName: 'Maya Santos',
    email: 'customer@brightstar.local',
    customerId: 'customer-demo-01',
    password: 'BrightStar123!',
  },
  {
    id: 'user-admin-demo',
    role: 'admin',
    displayName: 'Store Administrator',
    email: 'admin@brightstar.local',
    password: 'BrightStar123!',
  },
  {
    id: 'user-deliverer-demo',
    role: 'deliverer',
    displayName: 'Daniel Cruz',
    email: 'deliverer@brightstar.local',
    delivererId: 'deliverer-demo-01',
    password: 'BrightStar123!',
  },
];

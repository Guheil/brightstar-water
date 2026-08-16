import type { AuthAccount } from '@/types';

export const AUTH_ACCOUNTS: AuthAccount[] = [
  {
    id: 'user-customer-01',
    role: 'customer',
    displayName: 'Maya Santos',
    email: 'customer@brightstar.local',
    customerId: 'customer-01',
    password: 'BrightStar123!',
  },
  {
    id: 'user-admin-01',
    role: 'admin',
    displayName: 'Store Administrator',
    email: 'admin@brightstar.local',
    password: 'BrightStar123!',
  },
  {
    id: 'user-deliverer-01',
    role: 'deliverer',
    displayName: 'Daniel Cruz',
    email: 'deliverer@brightstar.local',
    delivererId: 'deliverer-01',
    password: 'BrightStar123!',
  },
];

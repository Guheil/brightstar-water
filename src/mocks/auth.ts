import type { DemoAuthAccount } from '@/types';

export const DEMO_AUTH_ACCOUNTS: DemoAuthAccount[] = [
  {
    id: 'user-customer-demo',
    role: 'customer',
    displayName: 'Maya Demo',
    email: 'customer.demo@example.test',
    customerId: 'customer-demo-01',
    demoPassword: 'demo-only',
  },
  {
    id: 'user-admin-demo',
    role: 'admin',
    displayName: 'Admin Demo',
    email: 'admin.demo@example.test',
    demoPassword: 'demo-only',
  },
  {
    id: 'user-deliverer-demo',
    role: 'deliverer',
    displayName: 'Driver Demo',
    email: 'deliverer.demo@example.test',
    delivererId: 'deliverer-demo-01',
    demoPassword: 'demo-only',
  },
];


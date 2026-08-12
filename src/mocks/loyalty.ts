import type { LoyaltyAccount, LoyaltyActivity } from '@/types';

export const LOYALTY_ACCOUNT_FIXTURES: LoyaltyAccount[] = [
  {
    customerId: 'customer-demo-01',
    pointsAvailable: 84,
    updatedAt: '2026-08-09T06:35:00.000Z',
  },
  {
    customerId: 'customer-demo-02',
    pointsAvailable: 15,
    updatedAt: '2026-07-28T10:20:00.000Z',
  },
  {
    customerId: 'customer-demo-03',
    pointsAvailable: 0,
    updatedAt: '2026-08-01T08:00:00.000Z',
  },
];

export const LOYALTY_ACTIVITY_FIXTURES: LoyaltyActivity[] = [
  {
    id: 'loyalty-event-0001',
    customerId: 'customer-demo-01',
    type: 'earned',
    points: 9,
    description: 'Points earned from delivered demo order MRJE-DEMO-0003.',
    orderId: 'order-0003',
    createdAt: '2026-08-09T06:35:00.000Z',
  },
  {
    id: 'loyalty-event-0002',
    customerId: 'customer-demo-02',
    type: 'manual_credit',
    points: 5,
    description: 'Fictional prototype adjustment.',
    reason: 'Demonstrates an Admin adjustment with a recorded reason.',
    createdAt: '2026-07-28T10:20:00.000Z',
  },
];


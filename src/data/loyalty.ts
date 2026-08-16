import type { LoyaltyAccount, LoyaltyActivity } from '@/types';

export const LOYALTY_ACCOUNT_DATA: LoyaltyAccount[] = [
  {
    customerId: 'customer-01',
    pointsAvailable: 84,
    updatedAt: '2026-08-09T06:35:00.000Z',
  },
  {
    customerId: 'customer-02',
    pointsAvailable: 15,
    updatedAt: '2026-07-28T10:20:00.000Z',
  },
  {
    customerId: 'customer-03',
    pointsAvailable: 0,
    updatedAt: '2026-08-01T08:00:00.000Z',
  },
];

export const LOYALTY_ACTIVITY_DATA: LoyaltyActivity[] = [
  {
    id: 'loyalty-event-0001',
    customerId: 'customer-01',
    type: 'earned',
    points: 9,
    description: 'Points earned from delivered order MRJE-0003.',
    orderId: 'order-0003',
    createdAt: '2026-08-09T06:35:00.000Z',
  },
  {
    id: 'loyalty-event-0002',
    customerId: 'customer-02',
    type: 'manual_credit',
    points: 5,
    description: 'Manual loyalty adjustment.',
    reason: 'Customer service adjustment approved by Store Administrator.',
    createdAt: '2026-07-28T10:20:00.000Z',
  },
];

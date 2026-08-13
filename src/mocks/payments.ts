import type { PaymentRecord } from '@/types';

export const PAYMENT_FIXTURES: PaymentRecord[] = [
  {
    id: 'payment-0001',
    orderId: 'order-0001',
    method: 'cod',
    status: 'collection_due',
    amountCentavos: 99_000,
    updatedAt: '2026-08-10T08:05:00.000Z',
  },
  {
    id: 'payment-0002',
    orderId: 'order-0002',
    method: 'cod',
    status: 'collection_due',
    amountCentavos: 45_000,
    updatedAt: '2026-08-10T09:00:00.000Z',
  },
  {
    id: 'payment-0003',
    orderId: 'order-0003',
    method: 'gcash',
    status: 'paid',
    amountCentavos: 97_000,
    demoReference: 'GCASH-0003',
    verifiedAt: '2026-08-08T11:30:00.000Z',
    paidAt: '2026-08-09T06:35:00.000Z',
    updatedAt: '2026-08-09T06:35:00.000Z',
  },
  {
    id: 'payment-0004',
    orderId: 'order-0004',
    method: 'gcash',
    status: 'verified',
    amountCentavos: 183_000,
    demoReference: 'GCASH-0004',
    verifiedAt: '2026-08-10T05:50:00.000Z',
    updatedAt: '2026-08-10T05:50:00.000Z',
  },
];

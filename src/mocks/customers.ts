import type { Customer } from '@/types';

const PROFILE_CREATED_AT = '2026-07-01T08:00:00.000Z';
const PROFILE_UPDATED_AT = '2026-08-01T08:00:00.000Z';

export const CUSTOMER_FIXTURES: Customer[] = [
  {
    id: 'customer-demo-01',
    displayName: 'Maya Demo',
    email: 'customer.demo@example.test',
    phonePlaceholder: '09XX-111-0001',
    status: 'active',
    addresses: [
      {
        id: 'address-demo-01-a',
        label: 'Sample home',
        recipientName: 'Maya Demo',
        phonePlaceholder: '09XX-111-0001',
        addressLine: '12 Sample Street, Demo Village',
        area: 'Zone A',
        municipality: 'Sample City',
        province: 'Laguna (Demo)',
        distanceKm: 2.5,
        deliveryNote: 'Fictional address for prototype use only.',
        isDefault: true,
      },
      {
        id: 'address-demo-01-b',
        label: 'Sample workshop',
        recipientName: 'Maya Demo',
        phonePlaceholder: '09XX-111-0001',
        addressLine: '88 Prototype Road, Test Park',
        area: 'Zone C',
        municipality: 'Sample City',
        province: 'Laguna (Demo)',
        distanceKm: 7.8,
        isDefault: false,
      },
    ],
    createdAt: PROFILE_CREATED_AT,
    updatedAt: PROFILE_UPDATED_AT,
  },
  {
    id: 'customer-demo-02',
    displayName: 'Paolo Sample',
    email: 'paolo.sample@example.test',
    phonePlaceholder: '09XX-222-0002',
    status: 'active',
    addresses: [
      {
        id: 'address-demo-02-a',
        label: 'Demo residence',
        recipientName: 'Paolo Sample',
        phonePlaceholder: '09XX-222-0002',
        addressLine: '34 Placeholder Avenue, Sample Heights',
        area: 'Zone B',
        municipality: 'Sample City',
        province: 'Laguna (Demo)',
        distanceKm: 4.5,
        isDefault: true,
      },
    ],
    createdAt: PROFILE_CREATED_AT,
    updatedAt: PROFILE_UPDATED_AT,
  },
  {
    id: 'customer-demo-03',
    displayName: 'Nica Placeholder',
    email: 'nica.placeholder@example.test',
    phonePlaceholder: '09XX-333-0003',
    status: 'active',
    addresses: [
      {
        id: 'address-demo-03-a',
        label: 'Outer demo zone',
        recipientName: 'Nica Placeholder',
        phonePlaceholder: '09XX-333-0003',
        addressLine: '7 Fictional Lane, Prototype Estates',
        area: 'Zone D',
        municipality: 'Sample City',
        province: 'Laguna (Demo)',
        distanceKm: 9.6,
        isDefault: true,
      },
    ],
    createdAt: PROFILE_CREATED_AT,
    updatedAt: PROFILE_UPDATED_AT,
  },
];


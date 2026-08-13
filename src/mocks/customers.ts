import type { Customer } from '@/types';

const PROFILE_CREATED_AT = '2026-07-01T08:00:00.000Z';
const PROFILE_UPDATED_AT = '2026-08-01T08:00:00.000Z';

export const CUSTOMER_FIXTURES: Customer[] = [
  {
    id: 'customer-demo-01',
    displayName: 'Maya Santos',
    email: 'customer@brightstar.local',
    phonePlaceholder: '09XX-111-0001',
    status: 'active',
    addresses: [
      {
        id: 'address-demo-01-a',
        label: 'Home',
        recipientName: 'Maya Santos',
        phonePlaceholder: '09XX-111-0001',
        addressLine: '12 Sampaguita Street',
        area: 'Pacita 1',
        municipality: 'San Pedro',
        province: 'Laguna',
        distanceKm: 2.5,
        deliveryNote: 'Please call upon arrival.',
        isDefault: true,
      },
      {
        id: 'address-demo-01-b',
        label: 'Workshop',
        recipientName: 'Maya Santos',
        phonePlaceholder: '09XX-111-0001',
        addressLine: '88 National Highway',
        area: 'Barangay Nueva',
        municipality: 'San Pedro',
        province: 'Laguna',
        distanceKm: 7.8,
        isDefault: false,
      },
    ],
    createdAt: PROFILE_CREATED_AT,
    updatedAt: PROFILE_UPDATED_AT,
  },
  {
    id: 'customer-demo-02',
    displayName: 'Paolo Garcia',
    email: 'paolo.garcia@brightstar.local',
    phonePlaceholder: '09XX-222-0002',
    status: 'active',
    addresses: [
      {
        id: 'address-demo-02-a',
        label: 'Residence',
        recipientName: 'Paolo Garcia',
        phonePlaceholder: '09XX-222-0002',
        addressLine: '34 Narra Street',
        area: 'Barangay San Vicente',
        municipality: 'San Pedro',
        province: 'Laguna',
        distanceKm: 4.5,
        isDefault: true,
      },
    ],
    createdAt: PROFILE_CREATED_AT,
    updatedAt: PROFILE_UPDATED_AT,
  },
  {
    id: 'customer-demo-03',
    displayName: 'Nica Rivera',
    email: 'nica.rivera@brightstar.local',
    phonePlaceholder: '09XX-333-0003',
    status: 'active',
    addresses: [
      {
        id: 'address-demo-03-a',
        label: 'Home',
        recipientName: 'Nica Rivera',
        phonePlaceholder: '09XX-333-0003',
        addressLine: '7 Mabini Street',
        area: 'Barangay Landayan',
        municipality: 'San Pedro',
        province: 'Laguna',
        distanceKm: 9.6,
        isDefault: true,
      },
    ],
    createdAt: PROFILE_CREATED_AT,
    updatedAt: PROFILE_UPDATED_AT,
  },
];

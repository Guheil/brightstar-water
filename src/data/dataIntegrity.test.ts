import { describe, expect, it } from 'vitest';
import {
  CUSTOMER_DATA,
  DELIVERER_DATA,
  DELIVERY_DATA,
  AUTH_ACCOUNTS,
  ORDER_DATA,
  PAYMENT_DATA,
} from '@/data';
import { createOrderReference } from '@/utils';

describe('application data integrity', () => {
  it('keeps account identities aligned with customer and deliverer profiles', () => {
    const customerAccount = AUTH_ACCOUNTS.find((account) => account.role === 'customer');
    const adminAccount = AUTH_ACCOUNTS.find((account) => account.role === 'admin');
    const delivererAccount = AUTH_ACCOUNTS.find((account) => account.role === 'deliverer');

    expect(customerAccount).toMatchObject({
      displayName: CUSTOMER_DATA[0].displayName,
      email: CUSTOMER_DATA[0].email,
      password: 'BrightStar123!',
    });
    expect(adminAccount).toMatchObject({
      displayName: 'Store Administrator',
      email: 'admin@brightstar.local',
      password: 'BrightStar123!',
    });
    expect(delivererAccount).toMatchObject({
      displayName: DELIVERER_DATA[0].displayName,
      email: DELIVERER_DATA[0].email,
      password: 'BrightStar123!',
    });
  });

  it('keeps every delivery address synchronized with its saved customer address', () => {
    for (const delivery of DELIVERY_DATA) {
      const order = ORDER_DATA.find((candidate) => candidate.id === delivery.orderId);
      if (!order) throw new Error(`Missing order for ${delivery.id}`);

      const customer = CUSTOMER_DATA.find(
        (candidate) => candidate.id === delivery.customerId,
      );
      const address = customer?.addresses.find(
        (candidate) => candidate.id === order.deliveryAddressId,
      );
      if (!address) throw new Error(`Missing customer address for ${delivery.id}`);

      expect(delivery.address).toEqual({
        recipientName: address.recipientName,
        phonePlaceholder: address.phonePlaceholder,
        addressLine: address.addressLine,
        area: address.area,
        municipality: address.municipality,
        province: address.province,
        distanceKm: address.distanceKm,
        ...(address.deliveryNote ? { deliveryNote: address.deliveryNote } : {}),
      });
    }
  });

  it('uses clean references and copy in values rendered by the application', () => {
    expect(ORDER_DATA.map((order) => order.reference)).toEqual([
      'MRJE-0001',
      'MRJE-0002',
      'MRJE-0003',
      'MRJE-0004',
    ]);
    expect(createOrderReference(5)).toBe('MRJE-0005');
    expect(PAYMENT_DATA.flatMap((payment) => payment.reference ?? [])).toEqual([
      'GCASH-0003',
      'GCASH-0004',
    ]);

    expect(PAYMENT_DATA.every((payment) => payment.orderId.length > 0)).toBe(true);
  });
});

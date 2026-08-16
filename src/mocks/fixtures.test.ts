import { describe, expect, it } from 'vitest';
import {
  CUSTOMER_FIXTURES,
  DELIVERER_FIXTURES,
  DELIVERY_FIXTURES,
  DEMO_AUTH_ACCOUNTS,
  INVENTORY_ADJUSTMENT_FIXTURES,
  LOYALTY_ACTIVITY_FIXTURES,
  ORDER_FIXTURES,
  PAYMENT_FIXTURES,
  PRODUCT_FIXTURES,
} from '@/mocks';
import { createOrderReference } from '@/utils';

const PRODUCTION_BREAKING_COPY =
  /\b(?:demo|mock|prototype|fictional|simulated?|simulation|placeholder|sample)\b/i;

describe('production-facing fixture copy', () => {
  it('keeps account identities aligned with customer and deliverer profiles', () => {
    const customerAccount = DEMO_AUTH_ACCOUNTS.find((account) => account.role === 'customer');
    const adminAccount = DEMO_AUTH_ACCOUNTS.find((account) => account.role === 'admin');
    const delivererAccount = DEMO_AUTH_ACCOUNTS.find((account) => account.role === 'deliverer');

    expect(customerAccount).toMatchObject({
      displayName: CUSTOMER_FIXTURES[0].displayName,
      email: CUSTOMER_FIXTURES[0].email,
      password: 'BrightStar123!',
    });
    expect(adminAccount).toMatchObject({
      displayName: 'Store Administrator',
      email: 'admin@brightstar.local',
      password: 'BrightStar123!',
    });
    expect(delivererAccount).toMatchObject({
      displayName: DELIVERER_FIXTURES[0].displayName,
      email: DELIVERER_FIXTURES[0].email,
      password: 'BrightStar123!',
    });
  });

  it('keeps every delivery address synchronized with its saved customer address', () => {
    for (const delivery of DELIVERY_FIXTURES) {
      const order = ORDER_FIXTURES.find((candidate) => candidate.id === delivery.orderId);
      if (!order) throw new Error(`Missing order for ${delivery.id}`);

      const customer = CUSTOMER_FIXTURES.find(
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
    expect(ORDER_FIXTURES.map((order) => order.reference)).toEqual([
      'MRJE-0001',
      'MRJE-0002',
      'MRJE-0003',
      'MRJE-0004',
    ]);
    expect(createOrderReference(5)).toBe('MRJE-0005');
    expect(PAYMENT_FIXTURES.flatMap((payment) => payment.reference ?? [])).toEqual([
      'GCASH-0003',
      'GCASH-0004',
    ]);

    const visibleCopy = [
      ...DEMO_AUTH_ACCOUNTS.flatMap((account) => [account.displayName, account.email]),
      ...CUSTOMER_FIXTURES.flatMap((customer) => [
        customer.displayName,
        customer.email,
        ...customer.addresses.flatMap((address) => [
          address.label,
          address.recipientName,
          address.addressLine,
          address.area,
          address.municipality,
          address.province,
          address.deliveryNote,
        ]),
      ]),
      ...DELIVERER_FIXTURES.flatMap((deliverer) => [deliverer.displayName, deliverer.email]),
      ...DELIVERY_FIXTURES.flatMap((delivery) => [
        delivery.address.recipientName,
        delivery.address.addressLine,
        delivery.address.area,
        delivery.address.municipality,
        delivery.address.province,
        delivery.address.deliveryNote,
        delivery.failure?.note,
      ]),
      ...PRODUCT_FIXTURES.flatMap((product) => [
        product.name,
        product.shortDescription,
        product.description,
        product.imageAlt,
      ]),
      ...ORDER_FIXTURES.flatMap((order) => [
        order.reference,
        order.customerNote,
        ...order.events.flatMap((event) => [event.label, event.description]),
      ]),
      ...PAYMENT_FIXTURES.map((payment) => payment.reference),
      ...INVENTORY_ADJUSTMENT_FIXTURES.map((adjustment) => adjustment.reason),
      ...LOYALTY_ACTIVITY_FIXTURES.flatMap((activity) => [
        activity.description,
        activity.reason,
      ]),
    ].filter((value): value is string => Boolean(value));

    expect(visibleCopy.filter((value) => PRODUCTION_BREAKING_COPY.test(value))).toEqual([]);
  });
});

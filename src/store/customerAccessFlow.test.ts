import { beforeEach, describe, expect, it } from 'vitest';
import { useAppStore } from '@/store';
import { authenticateCustomerFixture } from '@/test-utils/auth';
import { hydrateCatalogFixtures } from '@/test-utils/catalog';
import { calculateMapDistanceKm, DELIVERY_MAP_CONFIG } from '@/config';
import { resolveSafeNextPath } from '@/utils';

const AT = '2026-08-16T04:30:00.000Z';

describe('customer access and registration flow', () => {
  beforeEach(() => {
    useAppStore.getState().commands.resetAppState();
    hydrateCatalogFixtures();
  });

  it('starts signed out with an empty cart and blocks ordering commands', () => {
    const state = useAppStore.getState();
    expect(state.auth.session).toBeNull();
    expect(state.cart.items).toEqual([]);
    const result = state.commands.addCartItem('product-water-pump', 1);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('not_allowed');
  });

  it('hydrates a verified Supabase customer session into prototype state', () => {
    authenticateCustomerFixture(AT);
    const state = useAppStore.getState();
    expect(state.auth.session?.user.role).toBe('customer');
    expect(state.auth.initialized).toBe(true);
    expect(state.auth.session?.user.customerId).toBe('customer-01');
  });

  it('saves a pinned delivery location only for the signed-in customer', () => {
    const commands = useAppStore.getState().commands;
    authenticateCustomerFixture(AT);
    const result = commands.saveDeliveryAddress({
      customerId: 'customer-01',
      label: 'Pinned location',
      recipientName: 'Maya Santos',
      phone: '09171234567',
      addressLine: '12 Sample Street',
      area: 'San Lorenzo Ruiz',
      municipality: 'San Pedro',
      province: 'Laguna',
      distanceKm: 1.2,
      latitude: 14.354,
      longitude: 121.052,
      at: AT,
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.latitude).toBe(14.354);
  });

  it('requires a screenshot for GCash order placement', () => {
    const commands = useAppStore.getState().commands;
    authenticateCustomerFixture(AT);
    const withoutProof = commands.placeOrder({
      customerId: 'customer-01',
      items: [{ productId: 'product-water-pump', quantity: 1 }],
      deliveryAddressId: 'address-01-a',
      deliverySchedule: { date: '2026-08-17', windowLabel: '9:00 AM to 12:00 PM' },
      paymentMethod: 'gcash',
      placedAt: AT,
    });
    expect(withoutProof.ok).toBe(false);

    const withProof = commands.placeOrder({
      customerId: 'customer-01',
      items: [{ productId: 'product-water-pump', quantity: 1 }],
      deliveryAddressId: 'address-01-a',
      deliverySchedule: { date: '2026-08-17', windowLabel: '9:00 AM to 12:00 PM' },
      paymentMethod: 'gcash',
      paymentProofImageDataUrl: 'data:image/png;base64,aGVsbG8=',
      paymentProofFileName: 'receipt.png',
      placedAt: AT,
    });
    expect(withProof.ok).toBe(true);
  });
});

describe('customer navigation and map boundaries', () => {
  it('accepts only same-site return paths', () => {
    expect(resolveSafeNextPath('/brightstar/shop?q=refill')).toBe('/brightstar/shop?q=refill');
    expect(resolveSafeNextPath('//evil.example/path')).toBe('/customer/account');
    expect(resolveSafeNextPath('https://evil.example/path')).toBe('/customer/account');
  });

  it('returns zero at the configured service center and finite nearby distance', () => {
    expect(calculateMapDistanceKm(DELIVERY_MAP_CONFIG.serviceCenter)).toBe(0);
    expect(calculateMapDistanceKm({ latitude: 14.36, longitude: 121.06 })).toBeGreaterThan(0);
  });
});

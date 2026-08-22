import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const checkout = readFileSync(resolve(process.cwd(), 'src/screens/customer/CheckoutScreen/index.tsx'), 'utf8');
const map = readFileSync(resolve(process.cwd(), 'src/screens/customer/DeliveryPinMap/index.tsx'), 'utf8');
const authGate = readFileSync(resolve(process.cwd(), 'src/screens/public/AuthRequiredDialog/index.tsx'), 'utf8');
const authScaffold = readFileSync(resolve(process.cwd(), 'src/screens/auth/AuthScaffold/elements.tsx'), 'utf8');

describe('guided customer order flow', () => {
  it('uses a five-stage checkout with location and payment details', () => {
    ['location', 'schedule', 'payment', 'payment_details', 'review'].forEach((stage) => {
      expect(checkout).toContain(`id: '${stage}'`);
    });
  });

  it('uses saved addresses in checkout and a draggable map when an address is created', () => {
    expect(checkout).toContain('<AddressSelector');
    expect(checkout).toContain('<AddressEditorDialog');
    expect(map).toContain('new Marker({ draggable: true })');
    expect(map).toContain("map.on('click'");
  });

  it('warns before the GCash payment step and requires a screenshot', () => {
    expect(checkout).toContain('Before sending your payment');
    expect(checkout).toContain('amount, date, and reference number');
    expect(checkout).toContain('image/png,image/jpeg,image/webp');
  });

  it('prompts signed-out visitors to sign in or create an account', () => {
    expect(authGate).toContain('Sign in before starting your order');
    expect(authGate).toContain('Create account');
  });

  it('locks authentication pages to one viewport with internal form scrolling', () => {
    expect(authScaffold).toContain("height: '100dvh'");
    expect(authScaffold).toContain("overflow: 'hidden'");
    expect(authScaffold).toContain("overflowY: 'auto'");
  });
  it('uses a dynamic ETA and keeps the preferred delivery schedule optional', () => {
    expect(checkout).toContain('Estimated arrival');
    expect(checkout).toContain('Preferred delivery schedule · Optional');
    expect(checkout).toContain('Earliest available delivery');
    expect(checkout).toContain('Preferred delivery date');
    expect(checkout).toContain('Any available time');
    expect(checkout).not.toContain('const SCHEDULES');
    expect(checkout).not.toContain("date: '2026-08-17'");
  });

  it('puts preferred date bounds on the native input with the MUI 9 slot API', () => {
    expect(checkout).toContain('slotProps={{ htmlInput: { min: preferredDateBounds.min, max: preferredDateBounds.max } }}');
    expect(checkout).not.toContain('inputProps={{ min: preferredDateBounds.min, max: preferredDateBounds.max }}');
  });

  it('shows the real order-placement phases and prevents checkout navigation while the request is active', () => {
    expect(checkout).toContain("setPlacementPhase('creating_order')");
    expect(checkout).toContain("setPlacementPhase('refreshing_order_data')");
    expect(checkout).toContain("setPlacementPhase('opening_confirmation')");
    expect(checkout).toContain('<LoadingState');
    expect(checkout).toContain('aria-busy={placing}');
    expect(checkout).toContain('disabled={placing} onClick={previousStage}');
  });

});

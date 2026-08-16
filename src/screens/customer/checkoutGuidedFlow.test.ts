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

  it('uses a dynamically loaded draggable delivery map', () => {
    expect(checkout).toContain("dynamic(() => import('../DeliveryPinMap')");
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
});

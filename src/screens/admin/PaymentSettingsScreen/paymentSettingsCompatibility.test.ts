import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const paymentSettingsScreen = readFileSync(
  resolve(process.cwd(), 'src/screens/admin/PaymentSettingsScreen/index.tsx'),
  'utf8',
);
const ordersServer = readFileSync(
  resolve(process.cwd(), 'src/lib/orders/server.ts'),
  'utf8',
);

describe('Payment settings compatibility and type-safety regression checks', () => {
  it('uses the MUI v9 slot API for native text-field attributes', () => {
    expect(paymentSettingsScreen).toContain("slotProps={{ htmlInput: { maxLength: 100 } }}");
    expect(paymentSettingsScreen).toContain("slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 20 } }}");
    expect(paymentSettingsScreen).not.toMatch(/\binputProps\s*=/);
  });

  it('keeps the operational row boundary free of explicit any and lint suppression', () => {
    expect(ordersServer).not.toMatch(/Record<string,\s*any>/);
    expect(ordersServer).not.toContain('@typescript-eslint/no-explicit-any');
    expect(ordersServer).not.toContain('eslint-disable');
  });
});

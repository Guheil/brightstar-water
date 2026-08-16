import { describe, expect, it } from 'vitest';
import { DEMO_AUTH_ACCOUNTS } from '@/mocks';
import { createImmediateMockServices } from './createMockServices';

describe('mock services', () => {
  const account = DEMO_AUTH_ACCOUNTS[0];

  it('creates a standards-compliant session for valid credentials', async () => {
    const services = createImmediateMockServices(() => '2026-08-16T00:00:00.000Z');
    const result = await services.auth.signIn({
      email: account.email,
      password: account.password,
    });
    if (!result.ok) throw new Error('Expected valid fixture credentials to sign in.');

    expect(result).toEqual({
      ok: true,
      value: {
        user: {
          id: account.id,
          role: account.role,
          displayName: account.displayName,
          email: account.email,
          customerId: account.customerId,
        },
        signedInAt: '2026-08-16T00:00:00.000Z',
      },
    });
    await expect(services.auth.getSession()).resolves.toEqual(result.value);
  });

  it('rejects incorrect credentials and restores fixture data on reset', async () => {
    const services = createImmediateMockServices();
    const failedSignIn = await services.auth.signIn({
      email: account.email,
      password: 'not-the-password',
    });
    expect(failedSignIn).toMatchObject({ ok: false, error: { code: 'invalid_input' } });

    const initial = await services.dataService.loadSnapshot();
    await services.products.save({ ...initial.products[0], name: 'Temporary name' });
    const reset = await services.dataService.reset();

    expect(reset.products[0].name).toBe(initial.products[0].name);
  });
});

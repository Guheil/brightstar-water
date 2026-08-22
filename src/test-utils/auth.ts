import { CUSTOMER_DATA } from '@/data';
import { useAppStore } from '@/store';

export const TEST_AUTH_AT = '2026-08-12T04:00:00.000Z';

export function authenticateCustomerFixture(at = TEST_AUTH_AT) {
  const customer = CUSTOMER_DATA[0];
  const commands = useAppStore.getState().commands;
  commands.syncAuthSession({
    session: {
      user: {
        id: 'test-auth-user-customer-01',
        role: 'customer',
        displayName: customer.displayName,
        email: customer.email,
        customerId: customer.id,
      },
      signedInAt: at,
    },
    phone: customer.phonePlaceholder,
  });
  commands.syncCustomerCart(customer.id, []);
}

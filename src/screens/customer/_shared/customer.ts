import type { AppStore } from '@/store';

export const DEFAULT_CUSTOMER_ID = 'customer-demo-01';

export const getActiveCustomerId = (state: AppStore): string =>
  state.auth.session?.user.role === 'customer' && state.auth.session.user.customerId
    ? state.auth.session.user.customerId
    : DEFAULT_CUSTOMER_ID;


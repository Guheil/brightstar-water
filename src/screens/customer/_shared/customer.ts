import type { AppStore } from '@/store';
import type { EntityId } from '@/types';

export const getActiveCustomerId = (state: AppStore): EntityId | null =>
  state.auth.session?.user.role === 'customer' && state.auth.session.user.customerId
    ? state.auth.session.user.customerId
    : null;

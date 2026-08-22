import type { DeliveryAddress } from '@/types';

export interface DeleteAddressState {
  address: DeliveryAddress | null;
  busy: boolean;
}

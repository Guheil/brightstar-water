import type { DeliveryAddress } from '@/types';

export interface AddressSelectorProps {
  addresses: DeliveryAddress[];
  selectedId: string;
  onSelect: (addressId: string) => void;
}

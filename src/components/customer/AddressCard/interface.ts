import type { DeliveryAddress } from '@/types';

export interface AddressCardProps {
  address: DeliveryAddress;
  busy?: boolean;
  onDelete: (address: DeliveryAddress) => void;
  onEdit: (address: DeliveryAddress) => void;
  onSetDefault: (address: DeliveryAddress) => void;
}

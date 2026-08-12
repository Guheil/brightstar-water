import type { AuditStamp, EntityId } from './shared';

export type CustomerAccountStatus = 'active' | 'inactive';

export interface DeliveryAddress {
  id: EntityId;
  label: string;
  recipientName: string;
  phonePlaceholder: string;
  addressLine: string;
  area: string;
  municipality: string;
  province: string;
  distanceKm: number;
  deliveryNote?: string;
  isDefault: boolean;
}

export interface Customer extends AuditStamp {
  id: EntityId;
  displayName: string;
  email: string;
  phonePlaceholder: string;
  status: CustomerAccountStatus;
  addresses: DeliveryAddress[];
}


import type { AuditStamp, EntityId } from './shared';

export type CustomerAccountStatus = 'active' | 'inactive';

export interface DeliveryAddress {
  id: EntityId;
  label: string;
  addressType?: 'home' | 'work' | 'other';
  customLabel?: string;
  recipientName: string;
  phonePlaceholder: string;
  addressLine: string;
  area: string;
  regionCode?: string;
  regionName?: string;
  provinceCode?: string;
  municipalityCode?: string;
  barangayCode?: string;
  municipality: string;
  province: string;
  landmark?: string;
  distanceKm: number;
  latitude?: number;
  longitude?: number;
  deliveryNote?: string;
  isDefault: boolean;
  lastUsedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Customer extends AuditStamp {
  id: EntityId;
  displayName: string;
  email: string;
  phonePlaceholder: string;
  status: CustomerAccountStatus;
  addresses: DeliveryAddress[];
}


import type { DeliveryAddress } from '@/types';

export type DeliveryAddressType = 'home' | 'work' | 'other';

export interface AddressMutationInput {
  addressType: DeliveryAddressType;
  customLabel?: string;
  recipientName: string;
  phone: string;
  regionCode: string;
  regionName: string;
  provinceCode: string;
  provinceName: string;
  municipalityCode: string;
  municipalityName: string;
  barangayCode: string;
  barangayName: string;
  addressLine: string;
  landmark?: string;
  deliveryNote?: string;
  latitude: number;
  longitude: number;
  makeDefault?: boolean;
}

export interface AddressListResponse {
  addresses: DeliveryAddress[];
}

export interface AddressMutationResponse extends AddressListResponse {
  address: DeliveryAddress;
}

export interface PsgcOption {
  code: string;
  name: string;
  regionCode?: string;
  provinceCode?: string;
  municipalityCode?: string;
}

export type PsgcLevel = 'regions' | 'provinces' | 'municipalities' | 'barangays';

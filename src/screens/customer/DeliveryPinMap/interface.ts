import type { DeliveryCoordinate } from '@/config';

export interface DeliveryPinChange extends DeliveryCoordinate {
  distanceKm: number;
}

export interface DeliveryPinMapProps {
  initialCoordinate?: DeliveryCoordinate;
  onChange: (location: DeliveryPinChange) => void;
}

import { DELIVERY_FEE_CONFIG, DELIVERY_TRANSITIONS } from '@/config';
import type { DeliveryStatus, MoneyCentavos } from '@/types';

export type DeliveryQuote =
  | {
      serviceable: true;
      distanceKm: number;
      feeCentavos: MoneyCentavos;
      label: string;
    }
  | {
      serviceable: false;
      distanceKm: number;
      feeCentavos: null;
      label: string;
    };

export const calculateDeliveryFee = (distanceKm: number): DeliveryQuote => {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) {
    return {
      serviceable: false,
      distanceKm,
      feeCentavos: null,
      label: 'Choose a valid delivery zone.',
    };
  }

  const band = DELIVERY_FEE_CONFIG.bands.find(
    (candidate) =>
      distanceKm > candidate.minExclusiveKm && distanceKm <= candidate.maxInclusiveKm,
  );

  if (!band) {
    return {
      serviceable: false,
      distanceKm,
      feeCentavos: null,
      label: `Outside the ${DELIVERY_FEE_CONFIG.serviceRadiusKm} km service area`,
    };
  }

  return {
    serviceable: true,
    distanceKm,
    feeCentavos: band.feeCentavos,
    label: band.label,
  };
};

export const canTransitionDelivery = (
  from: DeliveryStatus,
  to: DeliveryStatus,
): boolean => DELIVERY_TRANSITIONS[from].includes(to);

import { LOYALTY_CONFIG } from '@/config';
import type { MoneyCentavos } from '@/types';

export const calculateLoyaltyPoints = (subtotalCentavos: MoneyCentavos): number => {
  if (subtotalCentavos < LOYALTY_CONFIG.minimumQualifyingSubtotalCentavos) {
    return 0;
  }

  return Math.floor(subtotalCentavos / LOYALTY_CONFIG.spendPerPointCentavos);
};

export const calculateLoyaltyPesoValue = (points: number): MoneyCentavos =>
  Math.max(0, Math.trunc(points)) * LOYALTY_CONFIG.pesoValuePerPointCentavos;

export const calculateLoyaltyDiscount = (requestedPoints: number): MoneyCentavos => {
  if (!LOYALTY_CONFIG.redemption.enabled || requestedPoints <= 0) return 0;
  return calculateLoyaltyPesoValue(requestedPoints);
};

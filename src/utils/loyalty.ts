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

export const calculateMaxLoyaltyRedeemablePoints = (
  availablePoints: number,
  merchandiseSubtotalCentavos: MoneyCentavos,
): number => {
  if (!LOYALTY_CONFIG.redemption.enabled) return 0;
  const normalizedAvailable = Math.max(0, Math.trunc(availablePoints));
  const merchandiseCap = Math.max(
    0,
    Math.floor(merchandiseSubtotalCentavos / LOYALTY_CONFIG.pesoValuePerPointCentavos),
  );
  return Math.min(
    normalizedAvailable,
    merchandiseCap,
    LOYALTY_CONFIG.redemption.maximumPointsPerOrder,
  );
};

export const calculateLoyaltyDiscount = (
  requestedPoints: number,
  merchandiseSubtotalCentavos?: MoneyCentavos,
): MoneyCentavos => {
  if (!LOYALTY_CONFIG.redemption.enabled || requestedPoints <= 0) return 0;
  const normalizedPoints = Math.max(0, Math.trunc(requestedPoints));
  const points = merchandiseSubtotalCentavos === undefined
    ? normalizedPoints
    : Math.min(
        normalizedPoints,
        Math.floor(merchandiseSubtotalCentavos / LOYALTY_CONFIG.pesoValuePerPointCentavos),
      );
  return calculateLoyaltyPesoValue(points);
};

/**
 * Loyalty points are settled after an eligible order is delivered.
 * Redemption follows the thesis rule of one point equaling one peso.
 * The bonus formula remains unavailable until its exact computation is confirmed.
 */
export const LOYALTY_CONFIG = {
  minimumQualifyingSubtotalCentavos: 50_000,
  spendPerPointCentavos: 10_000,
  pesoValuePerPointCentavos: 100,
  settleOnOrderStatus: 'delivered',
  bonus: {
    enabled: false,
    qualifyingOrders: 3,
    windowDays: 14,
    points: 0,
  },
  redemption: {
    enabled: true,
    minimumPoints: 1,
    maximumShareOfMerchandise: 1,
    maximumPointsPerOrder: 100_000,
  },
  notice: 'Earned points settle after eligible orders are delivered. Available points can be used during checkout at ₱1 per point.',
} as const;

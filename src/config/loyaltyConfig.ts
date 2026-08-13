/**
 * Loyalty points are settled after an eligible order is delivered.
 * Bonus awards and point redemption are currently unavailable.
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
    enabled: false,
    minimumPoints: 0,
    maximumShareOfOrder: 0,
  },
  notice: 'Loyalty points are awarded after eligible orders are delivered.',
} as const;

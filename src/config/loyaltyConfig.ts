/**
 * Prototype loyalty configuration pending final thesis/business confirmation.
 * Bonus and redemption are intentionally disabled until stakeholders choose one rule.
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
  notice: 'Prototype loyalty rule pending final thesis and business confirmation.',
} as const;


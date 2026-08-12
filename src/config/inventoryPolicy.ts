export const INVENTORY_POLICY = {
  reserveWhenOrderIsPlaced: true,
  deductOnDeliveryCompletion: true,
  releaseOnApprovedCancellation: true,
  restoreAutomaticallyAfterFailedDelivery: false,
  allowNegativeAvailableStock: false,
  notice: 'Prototype inventory timing pending business confirmation.',
} as const;


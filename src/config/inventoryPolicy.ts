export const INVENTORY_POLICY = {
  reserveWhenOrderIsPlaced: true,
  deductOnDeliveryCompletion: true,
  releaseOnApprovedCancellation: true,
  restoreAutomaticallyAfterFailedDelivery: false,
  allowNegativeAvailableStock: false,
  notice: 'Stock is reserved when an order is placed and deducted after delivery.',
} as const;

import type { MoneyCentavos, OrderTotals } from '@/types';

const PHP_FORMATTER = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 2,
});

export interface PricedQuantity {
  unitPriceCentavos: MoneyCentavos;
  quantity: number;
}

export const formatPhp = (centavos: MoneyCentavos): string =>
  PHP_FORMATTER.format(centavos / 100);

export const calculateLineTotal = (
  unitPriceCentavos: MoneyCentavos,
  quantity: number,
): MoneyCentavos => unitPriceCentavos * quantity;

export const calculateCartSubtotal = (items: readonly PricedQuantity[]): MoneyCentavos =>
  items.reduce(
    (subtotal, item) => subtotal + calculateLineTotal(item.unitPriceCentavos, item.quantity),
    0,
  );

export const calculateOrderTotals = (
  subtotalCentavos: MoneyCentavos,
  deliveryFeeCentavos: MoneyCentavos,
  loyaltyDiscountCentavos: MoneyCentavos = 0,
): OrderTotals => ({
  subtotalCentavos,
  deliveryFeeCentavos,
  loyaltyDiscountCentavos,
  totalCentavos: Math.max(
    0,
    subtotalCentavos + deliveryFeeCentavos - loyaltyDiscountCentavos,
  ),
});


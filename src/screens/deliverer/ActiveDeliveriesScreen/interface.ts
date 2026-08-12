import type { Delivery } from '@/types';

export interface DeliveryListRowProps {
  delivery: Delivery;
  customerName: string;
  orderReference: string;
}

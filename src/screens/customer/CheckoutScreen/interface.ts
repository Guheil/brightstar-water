import type { DeliverySchedule, PaymentMethod } from '@/types';

export type CheckoutStage =
  | 'location'
  | 'schedule'
  | 'payment'
  | 'payment_details'
  | 'review';

export interface CheckoutStageDefinition {
  id: CheckoutStage;
  label: string;
}

export interface ScheduleOption extends DeliverySchedule {
  id: string;
}

export interface StepVisualProps {
  $active: boolean;
  $complete: boolean;
}

export interface ChoiceVisualProps {
  $selected: boolean;
}

export interface PaymentChoice {
  method: PaymentMethod;
  title: string;
  description: string;
}

export interface DeliveryFormState {
  recipientName: string;
  phone: string;
  addressLine: string;
  area: string;
  municipality: string;
  province: string;
  deliveryNote: string;
}

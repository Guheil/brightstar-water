import type { PaymentMethod } from '@/types';

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

export type CheckoutPlacementPhase =
  | 'creating_order'
  | 'refreshing_order_data'
  | 'opening_confirmation';

export interface CheckoutPlacementProgress {
  label: string;
  description: string;
}

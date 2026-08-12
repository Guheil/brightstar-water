import type { DeliverySchedule, PaymentMethod } from '@/types';

export type CheckoutStage = 'delivery' | 'payment' | 'review';

export interface CheckoutStageDefinition {
  id: CheckoutStage;
  label: string;
}

export interface DemoScheduleOption extends DeliverySchedule {
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


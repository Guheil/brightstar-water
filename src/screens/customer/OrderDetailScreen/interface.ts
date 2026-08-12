export interface OrderDetailScreenProps {
  orderId: string;
}

export interface CancellationFormState {
  open: boolean;
  reason: string;
  error: string | null;
}


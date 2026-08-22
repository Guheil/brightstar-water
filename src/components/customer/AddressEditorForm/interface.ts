import type { DeliveryAddress } from '@/types';

export interface AddressEditorFormProps {
  initialAddress?: DeliveryAddress;
  initialRecipientName?: string;
  initialPhone?: string;
  onCancel?: () => void;
  onSaved: (addresses: DeliveryAddress[], saved: DeliveryAddress) => void;
  submitLabel?: string;
}

import type { DeliveryAddress } from '@/types';
export interface AddressEditorDialogProps {
  initialAddress?: DeliveryAddress;
  initialRecipientName?: string;
  initialPhone?: string;
  open: boolean;
  onClose: () => void;
  onSaved: (addresses: DeliveryAddress[], saved: DeliveryAddress) => void;
}

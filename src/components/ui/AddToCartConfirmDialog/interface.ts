export interface AddToCartConfirmDialogProps {
  maxQuantity: number;
  onClose: () => void;
  onConfirm: () => void;
  onQuantityChange: (quantity: number) => void;
  open: boolean;
  productName: string;
  quantity: number;
  subtotalLabel: string;
}

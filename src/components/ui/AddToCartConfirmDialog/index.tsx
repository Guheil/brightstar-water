'use client';

import { useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import DialogMotionTransition from '@/components/ui/DialogMotionTransition';
import { dialogMotion } from '@/theme/transitions';
import QuantityControl from '@/components/ui/QuantityControl';
import {
  CancelButton,
  CartDialog,
  CartDialogActions,
  CartDialogContent,
  CartDialogText,
  CartDialogTitle,
  CartMark,
  CartSummary,
  ConfirmButton,
  QuantitySlot,
  SummaryLabel,
  SummaryRow,
  SummaryValue,
  TitleText,
} from './elements';
import type { AddToCartConfirmDialogProps } from './interface';

export default function AddToCartConfirmDialog({
  maxQuantity,
  onClose,
  onConfirm,
  onQuantityChange,
  open,
  productName,
  quantity,
  subtotalLabel,
}: AddToCartConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const boundedMaximum = Math.max(1, maxQuantity);
    if (quantity > boundedMaximum) onQuantityChange(boundedMaximum);
  }, [maxQuantity, onQuantityChange, open, quantity]);

  return (
    <CartDialog
      aria-describedby="add-to-cart-confirm-description"
      aria-labelledby="add-to-cart-confirm-title"
      onClose={onClose}
      open={open}
      slots={{ transition: DialogMotionTransition }}
      transitionDuration={{ enter: dialogMotion.enterDuration, exit: dialogMotion.exitDuration }}
    >
      <CartDialogTitle id="add-to-cart-confirm-title">
        <CartMark aria-hidden="true" data-modal-icon>
          <ShoppingCart />
        </CartMark>
        <TitleText data-modal-title-text>Add to cart?</TitleText>
      </CartDialogTitle>
      <CartDialogContent data-modal-body>
        <CartDialogText id="add-to-cart-confirm-description">
          Confirm the product and adjust the quantity before adding it to your cart.
        </CartDialogText>
        <CartSummary aria-label="Cart addition summary" role="group">
          <SummaryRow>
            <SummaryLabel>Product</SummaryLabel>
            <SummaryValue>{productName}</SummaryValue>
          </SummaryRow>
          <SummaryRow>
            <SummaryLabel>Quantity</SummaryLabel>
            <QuantitySlot>
              <QuantityControl
                label={`${productName} quantity`}
                max={Math.max(1, maxQuantity)}
                onChange={onQuantityChange}
                value={quantity}
              />
            </QuantitySlot>
          </SummaryRow>
          <SummaryRow>
            <SummaryLabel>Subtotal</SummaryLabel>
            <SummaryValue>{subtotalLabel}</SummaryValue>
          </SummaryRow>
        </CartSummary>
      </CartDialogContent>
      <CartDialogActions data-modal-actions>
        <CancelButton autoFocus onClick={onClose}>Cancel</CancelButton>
        <ConfirmButton onClick={onConfirm} variant="contained">
          Add to cart
        </ConfirmButton>
      </CartDialogActions>
    </CartDialog>
  );
}

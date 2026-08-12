'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Smartphone, ShoppingBasket } from 'lucide-react';
import { EmptyState, Notice } from '@/components';
import { useAppStore } from '@/store';
import type { PaymentMethod } from '@/types';
import {
  calculateCartSubtotal,
  calculateDeliveryFee,
  calculateLoyaltyPoints,
  calculateOrderTotals,
  formatPhp,
  getAvailableStock,
} from '@/utils';
import { useCustomerCart } from '../_shared/CustomerAreaShell';
import { getActiveCustomerId } from '../_shared/customer';
import {
  Actions,
  BackLink,
  CheckoutLayout,
  CheckoutPage,
  ChoiceCard,
  ChoiceCopy,
  ChoiceDescription,
  ChoiceList,
  ChoiceRadio,
  ChoiceTitle,
  DemoPaymentPanel,
  FinePrint,
  Header,
  Lead,
  NoteField,
  PrimaryButton,
  ReviewItem,
  ReviewLabel,
  ReviewList,
  ReviewValue,
  SecondaryButton,
  StageDescription,
  StagePanel,
  StageTitle,
  Step,
  StepList,
  StepNumber,
  SummaryList,
  SummaryPanel,
  SummaryRow,
  SummaryTitle,
  SummaryTotal,
  Title,
} from './elements';
import type {
  CheckoutStage,
  CheckoutStageDefinition,
  DemoScheduleOption,
  PaymentChoice,
} from './interface';

const STAGES: readonly CheckoutStageDefinition[] = [
  { id: 'delivery', label: 'Delivery' },
  { id: 'payment', label: 'Payment' },
  { id: 'review', label: 'Review' },
];

const SCHEDULES: readonly DemoScheduleOption[] = [
  { id: 'slot-morning', date: '2026-08-14', windowLabel: '9:00 AM–12:00 PM' },
  { id: 'slot-afternoon', date: '2026-08-14', windowLabel: '1:00 PM–4:00 PM' },
  { id: 'slot-next-day', date: '2026-08-15', windowLabel: '9:00 AM–12:00 PM' },
];

const PAYMENT_CHOICES: readonly PaymentChoice[] = [
  {
    method: 'cod',
    title: 'Cash on delivery',
    description: 'The fictional amount is marked for collection when the order is delivered.',
  },
  {
    method: 'gcash',
    title: 'GCash demo',
    description: 'Creates an awaiting-verification state. No real transfer or account is used.',
  },
];

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, clearCart, setLastPlacedOrderId } = useCustomerCart();
  const customerId = useAppStore(getActiveCustomerId);
  const customers = useAppStore((state) => state.customers.records);
  const products = useAppStore((state) => state.catalog.products);
  const inventory = useAppStore((state) => state.inventory.items);
  const placeOrder = useAppStore((state) => state.commands.placeOrder);
  const customer = customers.find((item) => item.id === customerId);
  const lines = items.flatMap((cartItem) => {
    const product = products.find((item) => item.id === cartItem.productId);
    const stock = inventory.find((item) => item.productId === cartItem.productId);
    return product && stock
      ? [{ cartItem, product, availableStock: getAvailableStock(stock) }]
      : [];
  });
  const hasMissingProduct = lines.length !== items.length;
  const stockIssues = lines.filter(
    ({ cartItem, availableStock }) => cartItem.quantity > availableStock,
  );
  const hasAvailabilityIssue = hasMissingProduct || stockIssues.length > 0;
  const [stage, setStage] = useState<CheckoutStage>('delivery');
  const [addressId, setAddressId] = useState(
    customer?.addresses.find((address) => address.isDefault)?.id ?? customer?.addresses[0]?.id ?? '',
  );
  const [scheduleId, setScheduleId] = useState(SCHEDULES[0].id);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [customerNote, setCustomerNote] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedAddress = customer?.addresses.find((address) => address.id === addressId);
  const selectedSchedule = SCHEDULES.find((item) => item.id === scheduleId) ?? SCHEDULES[0];
  const deliveryQuote = selectedAddress
    ? calculateDeliveryFee(selectedAddress.distanceKm)
    : null;
  const subtotal = calculateCartSubtotal(
    lines.map(({ cartItem, product }) => ({
      quantity: cartItem.quantity,
      unitPriceCentavos: product.priceCentavos,
    })),
  );
  const totals = calculateOrderTotals(
    subtotal,
    deliveryQuote?.serviceable ? deliveryQuote.feeCentavos : 0,
  );
  const pointsPending = calculateLoyaltyPoints(subtotal);
  const stageIndex = STAGES.findIndex((item) => item.id === stage);

  if (!customer || !lines.length) {
    return (
      <CheckoutPage>
        <EmptyState
          action={<BackLink href="/customer/cart">Return to cart</BackLink>}
          description="Add available products to your cart before starting checkout."
          icon={<ShoppingBasket />}
          title="Checkout needs a cart"
        />
      </CheckoutPage>
    );
  }

  const nextStage = () => {
    setError(null);
    if (stage === 'delivery') setStage('payment');
    if (stage === 'payment') setStage('review');
  };

  const previousStage = () => {
    setError(null);
    if (stage === 'review') setStage('payment');
    if (stage === 'payment') setStage('delivery');
  };

  const submitOrder = () => {
    if (hasAvailabilityIssue) {
      setError('Return to your cart and adjust products that no longer have enough demo stock.');
      return;
    }
    if (!selectedAddress || !deliveryQuote?.serviceable) {
      setError('Choose a demo address inside the 10 km service area.');
      return;
    }
    setPlacing(true);
    setError(null);
    globalThis.setTimeout(() => {
      const result = placeOrder({
        customerId,
        items: lines.map(({ cartItem, product }) => ({
          productId: product.id,
          quantity: cartItem.quantity,
        })),
        deliveryAddressId: selectedAddress.id,
        deliverySchedule: {
          date: selectedSchedule.date,
          windowLabel: selectedSchedule.windowLabel,
        },
        paymentMethod,
        customerNote: customerNote.trim() || undefined,
      });

      if (!result.ok) {
        setError(result.error.message);
        setPlacing(false);
        return;
      }

      clearCart();
      setLastPlacedOrderId(result.value.id);
      router.push(`/customer/orders/${result.value.id}/confirmation`);
    }, 450);
  };

  return (
    <CheckoutPage>
      <Header>
        <BackLink href="/customer/cart">Back to cart</BackLink>
        <Title>Checkout</Title>
        <Lead>
          Complete three clear steps to place a fictional order in the shared demo workflow.
        </Lead>
      </Header>

      <StepList aria-label="Checkout progress">
        {STAGES.map((item, index) => (
          <Step
            aria-current={item.id === stage ? 'step' : undefined}
            key={item.id}
            $active={item.id === stage}
            $complete={index < stageIndex}
          >
            <StepNumber>{index + 1}</StepNumber>
            {item.label}
          </Step>
        ))}
      </StepList>

      <CheckoutLayout>
        <StagePanel>
          {error ? <Notice tone="error" title="Could not continue">{error}</Notice> : null}
          {hasAvailabilityIssue ? (
            <Notice tone="warning" title="Cart availability changed">
              {hasMissingProduct
                ? 'A product in your cart is no longer available in the demo catalog. '
                : ''}
              {stockIssues.map(({ product, availableStock }) =>
                `${product.name} has ${availableStock} available.`,
              ).join(' ')} Return to the cart before placing this order.
            </Notice>
          ) : null}

          {stage === 'delivery' ? (
            <>
              <StageTitle>Choose delivery details</StageTitle>
              <StageDescription>
                Address distances are fixed fixtures for fee simulation. No live location is used.
              </StageDescription>
              <ChoiceList role="radiogroup" aria-label="Saved delivery address">
                {customer.addresses.map((address) => (
                  <ChoiceCard key={address.id} $selected={address.id === addressId}>
                    <ChoiceRadio
                      checked={address.id === addressId}
                      name="delivery-address"
                      onChange={() => setAddressId(address.id)}
                      value={address.id}
                    />
                    <ChoiceCopy>
                      <ChoiceTitle>{address.label}</ChoiceTitle>
                      <ChoiceDescription>
                        {address.addressLine}, {address.municipality} · {address.distanceKm} km
                      </ChoiceDescription>
                    </ChoiceCopy>
                  </ChoiceCard>
                ))}
              </ChoiceList>

              <StageTitle>Choose a demo schedule</StageTitle>
              <ChoiceList role="radiogroup" aria-label="Delivery schedule">
                {SCHEDULES.map((schedule) => (
                  <ChoiceCard key={schedule.id} $selected={schedule.id === scheduleId}>
                    <ChoiceRadio
                      checked={schedule.id === scheduleId}
                      name="delivery-schedule"
                      onChange={() => setScheduleId(schedule.id)}
                      value={schedule.id}
                    />
                    <ChoiceCopy>
                      <ChoiceTitle>{schedule.date}</ChoiceTitle>
                      <ChoiceDescription>{schedule.windowLabel}</ChoiceDescription>
                    </ChoiceCopy>
                  </ChoiceCard>
                ))}
              </ChoiceList>
              <NoteField
                label="Delivery note"
                minRows={3}
                multiline
                onChange={(event) => setCustomerNote(event.target.value)}
                value={customerNote}
              />
            </>
          ) : null}

          {stage === 'payment' ? (
            <>
              <StageTitle>Select a payment method</StageTitle>
              <StageDescription>
                Both options are presentation states. This frontend cannot collect or verify real money.
              </StageDescription>
              <ChoiceList role="radiogroup" aria-label="Payment method">
                {PAYMENT_CHOICES.map((choice) => (
                  <ChoiceCard
                    key={choice.method}
                    $selected={choice.method === paymentMethod}
                  >
                    <ChoiceRadio
                      checked={choice.method === paymentMethod}
                      name="payment-method"
                      onChange={() => setPaymentMethod(choice.method)}
                      value={choice.method}
                    />
                    <ChoiceCopy>
                      <ChoiceTitle>{choice.title}</ChoiceTitle>
                      <ChoiceDescription>{choice.description}</ChoiceDescription>
                    </ChoiceCopy>
                  </ChoiceCard>
                ))}
              </ChoiceList>
              {paymentMethod === 'gcash' ? (
                <DemoPaymentPanel>
                  <Smartphone aria-hidden="true" />
                  <StageDescription>
                    Demo QR intentionally unavailable. Admin verification is simulated after placement.
                  </StageDescription>
                </DemoPaymentPanel>
              ) : null}
            </>
          ) : null}

          {stage === 'review' ? (
            <>
              <StageTitle>Review the demo order</StageTitle>
              <StageDescription>
                Nothing below represents a real customer, payment, or scheduled delivery.
              </StageDescription>
              <ReviewList>
                {lines.map(({ cartItem, product }) => (
                  <ReviewItem key={product.id}>
                    <ReviewLabel>{product.name} × {cartItem.quantity}</ReviewLabel>
                    <ReviewValue>{formatPhp(product.priceCentavos * cartItem.quantity)}</ReviewValue>
                  </ReviewItem>
                ))}
                <ReviewItem>
                  <ReviewLabel>Deliver to</ReviewLabel>
                  <ReviewValue>{selectedAddress?.label}</ReviewValue>
                </ReviewItem>
                <ReviewItem>
                  <ReviewLabel>Schedule</ReviewLabel>
                  <ReviewValue>{selectedSchedule.date}, {selectedSchedule.windowLabel}</ReviewValue>
                </ReviewItem>
                <ReviewItem>
                  <ReviewLabel>Payment</ReviewLabel>
                  <ReviewValue>{paymentMethod === 'cod' ? 'Cash on delivery' : 'GCash demo'}</ReviewValue>
                </ReviewItem>
              </ReviewList>
            </>
          ) : null}

          <Actions>
            {stage === 'delivery' ? <span /> : (
              <SecondaryButton onClick={previousStage}>Back</SecondaryButton>
            )}
            {stage === 'review' ? (
              <PrimaryButton disabled={placing} onClick={submitOrder} variant="contained">
                {placing ? 'Placing demo order…' : 'Place demo order'}
              </PrimaryButton>
            ) : (
              <PrimaryButton
                disabled={!deliveryQuote?.serviceable || hasAvailabilityIssue}
                onClick={nextStage}
                variant="contained"
              >
                Continue
              </PrimaryButton>
            )}
          </Actions>
        </StagePanel>

        <SummaryPanel>
          <SummaryTitle>Order summary</SummaryTitle>
          <SummaryList>
            <SummaryRow><dt>Subtotal</dt><dd>{formatPhp(totals.subtotalCentavos)}</dd></SummaryRow>
            <SummaryRow><dt>Delivery</dt><dd>{formatPhp(totals.deliveryFeeCentavos)}</dd></SummaryRow>
            <SummaryTotal><dt>Total</dt><dd>{formatPhp(totals.totalCentavos)}</dd></SummaryTotal>
          </SummaryList>
          {deliveryQuote ? (
            <Notice tone={deliveryQuote.serviceable ? 'info' : 'warning'}>
              {deliveryQuote.label}
            </Notice>
          ) : null}
          <FinePrint>
            Estimated loyalty after delivery: {pointsPending} points. One point per ₱100 applies only to qualifying subtotals of at least ₱500. Bonus and redemption remain disabled pending confirmation.
          </FinePrint>
        </SummaryPanel>
      </CheckoutLayout>
    </CheckoutPage>
  );
}

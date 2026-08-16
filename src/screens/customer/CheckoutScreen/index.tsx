'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Smartphone, ShoppingBasket, WalletCards } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EmptyState, Notice } from '@/components';
import { DELIVERY_MAP_CONFIG } from '@/config';
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
import type { DeliveryPinChange } from '../DeliveryPinMap/interface';
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
  Field,
  FinePrint,
  FullField,
  Header,
  HiddenFileInput,
  Lead,
  LocationFields,
  NoteField,
  PaymentAmount,
  PaymentNoticeActions,
  PaymentNoticeContent,
  PaymentNoticeDialog,
  PaymentNoticeTitle,
  PaymentPanel,
  PrimaryButton,
  ProofPreview,
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
  UploadArea,
  UploadButton,
} from './elements';
import type {
  CheckoutStage,
  CheckoutStageDefinition,
  DeliveryFormState,
  PaymentChoice,
  ScheduleOption,
} from './interface';

const DeliveryPinMap = dynamic(() => import('../DeliveryPinMap'), {
  ssr: false,
  loading: () => <Notice tone="info">Loading the delivery map…</Notice>,
});

const STAGES: readonly CheckoutStageDefinition[] = [
  { id: 'location', label: 'Location' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'payment', label: 'Payment' },
  { id: 'payment_details', label: 'Payment details' },
  { id: 'review', label: 'Review' },
];

const SCHEDULES: readonly ScheduleOption[] = [
  { id: 'slot-morning', date: '2026-08-17', windowLabel: '9:00 AM to 12:00 PM' },
  { id: 'slot-afternoon', date: '2026-08-17', windowLabel: '1:00 PM to 4:00 PM' },
  { id: 'slot-next-day', date: '2026-08-18', windowLabel: '9:00 AM to 12:00 PM' },
];

const PAYMENT_CHOICES: readonly PaymentChoice[] = [
  {
    method: 'cod',
    title: 'Cash on delivery',
    description: 'Prepare the final amount and pay when your order arrives.',
  },
  {
    method: 'gcash',
    title: 'GCash',
    description: 'Send the payment, upload a clear screenshot, and wait for payment review.',
  },
];

const allowedProofTypes = new Set(['image/png', 'image/jpeg', 'image/webp']);
const maxProofBytes = 5 * 1024 * 1024;

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, clearCart, setLastPlacedOrderId } = useCustomerCart();
  const customerId = useAppStore(getActiveCustomerId);
  const customers = useAppStore((state) => state.customers.records);
  const products = useAppStore((state) => state.catalog.products);
  const inventory = useAppStore((state) => state.inventory.items);
  const placeOrder = useAppStore((state) => state.commands.placeOrder);
  const saveDeliveryAddress = useAppStore((state) => state.commands.saveDeliveryAddress);
  const customer = customers.find((item) => item.id === customerId);
  const defaultAddress = customer?.addresses.find((address) => address.isDefault) ?? customer?.addresses[0];
  const lines = items.flatMap((cartItem) => {
    const product = products.find((item) => item.id === cartItem.productId);
    const stock = inventory.find((item) => item.productId === cartItem.productId);
    return product && stock
      ? [{ cartItem, product, availableStock: getAvailableStock(stock) }]
      : [];
  });
  const hasMissingProduct = lines.length !== items.length;
  const stockIssues = lines.filter(({ cartItem, availableStock }) => cartItem.quantity > availableStock);
  const hasAvailabilityIssue = hasMissingProduct || stockIssues.length > 0;
  const [stage, setStage] = useState<CheckoutStage>('location');
  const [scheduleId, setScheduleId] = useState(SCHEDULES[0].id);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [customerNote, setCustomerNote] = useState('');
  const [deliveryAddressId, setDeliveryAddressId] = useState('');
  const [pinLocation, setPinLocation] = useState<DeliveryPinChange | null>(null);
  const [paymentNoticeOpen, setPaymentNoticeOpen] = useState(false);
  const [proofImageDataUrl, setProofImageDataUrl] = useState('');
  const [proofFileName, setProofFileName] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deliveryForm, setDeliveryForm] = useState<DeliveryFormState>({
    recipientName: defaultAddress?.recipientName ?? customer?.displayName ?? '',
    phone: defaultAddress?.phonePlaceholder ?? customer?.phonePlaceholder ?? '',
    addressLine: defaultAddress?.addressLine ?? '',
    area: defaultAddress?.area ?? '',
    municipality: defaultAddress?.municipality ?? 'San Pedro',
    province: defaultAddress?.province ?? 'Laguna',
    deliveryNote: defaultAddress?.deliveryNote ?? '',
  });

  const selectedSchedule = SCHEDULES.find((item) => item.id === scheduleId) ?? SCHEDULES[0];
  const deliveryQuote = pinLocation ? calculateDeliveryFee(pinLocation.distanceKm) : null;
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
  const locationComplete = Boolean(
    deliveryForm.recipientName.trim() &&
    deliveryForm.phone.trim() &&
    deliveryForm.addressLine.trim() &&
    deliveryForm.area.trim() &&
    pinLocation &&
    deliveryQuote?.serviceable,
  );

  const mapInitialCoordinate = useMemo(
    () => defaultAddress?.latitude != null && defaultAddress.longitude != null
      ? { latitude: defaultAddress.latitude, longitude: defaultAddress.longitude }
      : DELIVERY_MAP_CONFIG.serviceCenter,
    [defaultAddress],
  );

  if (!customer || !customerId || !lines.length) {
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

  const updateDeliveryField = (field: keyof DeliveryFormState, value: string) => {
    setDeliveryAddressId('');
    setDeliveryForm((current) => ({ ...current, [field]: value }));
  };

  const handlePinChange = (nextLocation: DeliveryPinChange) => {
    setDeliveryAddressId('');
    setPinLocation(nextLocation);
  };

  const saveCheckoutLocation = () => {
    setError(null);
    if (!pinLocation) {
      setError('Choose the exact delivery point on the map.');
      return false;
    }
    if (!deliveryQuote?.serviceable) {
      setError('Choose a delivery point inside the 10 km service area.');
      return false;
    }
    if (!locationComplete) {
      setError('Complete the recipient and delivery address details.');
      return false;
    }
    if (deliveryAddressId) return true;

    const result = saveDeliveryAddress({
      customerId,
      label: 'Order delivery',
      recipientName: deliveryForm.recipientName,
      phone: deliveryForm.phone,
      addressLine: deliveryForm.addressLine,
      area: deliveryForm.area,
      municipality: deliveryForm.municipality,
      province: deliveryForm.province,
      distanceKm: pinLocation.distanceKm,
      latitude: pinLocation.latitude,
      longitude: pinLocation.longitude,
      deliveryNote: deliveryForm.deliveryNote || undefined,
      makeDefault: customer.addresses.length === 0,
    });
    if (!result.ok) {
      setError(result.error.message);
      return false;
    }
    setDeliveryAddressId(result.value.id);
    return true;
  };

  const nextStage = () => {
    setError(null);
    if (stage === 'location') {
      if (saveCheckoutLocation()) setStage('schedule');
      return;
    }
    if (stage === 'schedule') {
      setStage('payment');
      return;
    }
    if (stage === 'payment') {
      if (paymentMethod === 'gcash') {
        setPaymentNoticeOpen(true);
      } else {
        setStage('payment_details');
      }
      return;
    }
    if (stage === 'payment_details') {
      if (paymentMethod === 'gcash' && !proofImageDataUrl) {
        setError('Upload a clear screenshot of your GCash payment before continuing.');
        return;
      }
      setStage('review');
    }
  };

  const previousStage = () => {
    setError(null);
    if (stage === 'schedule') setStage('location');
    if (stage === 'payment') setStage('schedule');
    if (stage === 'payment_details') setStage('payment');
    if (stage === 'review') setStage('payment_details');
  };

  const handleProofUpload = (file?: File) => {
    setError(null);
    if (!file) return;
    if (!allowedProofTypes.has(file.type)) {
      setError('Choose a PNG, JPG, or WebP screenshot.');
      return;
    }
    if (file.size > maxProofBytes) {
      setError('Choose a screenshot smaller than 5 MB.');
      return;
    }
    const cleanName = file.name.replace(/[^a-zA-Z0-9._ -]/g, '').slice(0, 100) || 'payment-proof';
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string' || !reader.result.startsWith('data:image/')) {
        setError('That screenshot could not be read. Choose another image.');
        return;
      }
      setProofFileName(cleanName);
      setProofImageDataUrl(reader.result);
    };
    reader.onerror = () => setError('That screenshot could not be read. Choose another image.');
    reader.readAsDataURL(file);
  };

  const submitOrder = () => {
    if (hasAvailabilityIssue) {
      setError('Return to your cart and adjust products that no longer have enough stock.');
      return;
    }
    if (!deliveryAddressId || !deliveryQuote?.serviceable) {
      setError('Confirm your delivery location before placing the order.');
      return;
    }
    if (paymentMethod === 'gcash' && !proofImageDataUrl) {
      setError('Upload your GCash payment screenshot before placing the order.');
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
        deliveryAddressId,
        deliverySchedule: {
          date: selectedSchedule.date,
          windowLabel: selectedSchedule.windowLabel,
        },
        paymentMethod,
        ...(paymentMethod === 'gcash' && proofImageDataUrl
          ? { paymentProofImageDataUrl: proofImageDataUrl, paymentProofFileName: proofFileName }
          : {}),
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
        <Lead>Set the delivery point, choose a schedule and payment method, then review everything before placing the order.</Lead>
      </Header>

      <StepList aria-label="Checkout progress">
        {STAGES.map((item, index) => (
          <Step
            aria-current={item.id === stage ? 'step' : undefined}
            key={item.id}
            $active={item.id === stage}
            $complete={index < stageIndex}
          >
            <StepNumber>{String(index + 1).padStart(2, '0')}</StepNumber>
            {item.label}
          </Step>
        ))}
      </StepList>

      <CheckoutLayout>
        <StagePanel>
          {error ? <Notice tone="error" title="Could not continue">{error}</Notice> : null}
          {hasAvailabilityIssue ? (
            <Notice tone="warning" title="Cart availability changed">
              {hasMissingProduct ? 'A product in your cart is no longer available. ' : ''}
              {stockIssues.map(({ product, availableStock }) => `${product.name} has ${availableStock} available.`).join(' ')}
            </Notice>
          ) : null}

          {stage === 'location' ? (
            <>
              <StageTitle>Pin the delivery location</StageTitle>
              <StageDescription>Place the marker where you want the order delivered. The delivery fee updates from that point.</StageDescription>
              <DeliveryPinMap initialCoordinate={mapInitialCoordinate} onChange={handlePinChange} />
              {deliveryQuote ? (
                <Notice tone={deliveryQuote.serviceable ? 'info' : 'warning'}>
                  {pinLocation?.distanceKm.toFixed(2)} km from the service point. {deliveryQuote.label}
                </Notice>
              ) : null}
              <LocationFields>
                <Field
                  label="Recipient name"
                  onChange={(event) => updateDeliveryField('recipientName', event.target.value)}
                  value={deliveryForm.recipientName}
                />
                <Field
                  label="Mobile number"
                  onChange={(event) => updateDeliveryField('phone', event.target.value)}
                  value={deliveryForm.phone}
                />
                <FullField
                  label="Street, building, or house details"
                  onChange={(event) => updateDeliveryField('addressLine', event.target.value)}
                  value={deliveryForm.addressLine}
                />
                <Field
                  label="Barangay or area"
                  onChange={(event) => updateDeliveryField('area', event.target.value)}
                  value={deliveryForm.area}
                />
                <Field
                  label="City"
                  onChange={(event) => updateDeliveryField('municipality', event.target.value)}
                  value={deliveryForm.municipality}
                />
                <Field
                  label="Province"
                  onChange={(event) => updateDeliveryField('province', event.target.value)}
                  value={deliveryForm.province}
                />
                <FullField
                  label="Delivery note (optional)"
                  multiline
                  minRows={2}
                  onChange={(event) => updateDeliveryField('deliveryNote', event.target.value)}
                  value={deliveryForm.deliveryNote}
                />
              </LocationFields>
            </>
          ) : null}

          {stage === 'schedule' ? (
            <>
              <StageTitle>Choose a delivery schedule</StageTitle>
              <StageDescription>Select the date and time window that works for you.</StageDescription>
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
                label="Order note (optional)"
                minRows={3}
                multiline
                onChange={(event) => setCustomerNote(event.target.value)}
                value={customerNote}
              />
            </>
          ) : null}

          {stage === 'payment' ? (
            <>
              <StageTitle>Choose how you want to pay</StageTitle>
              <StageDescription>Your payment details are reviewed on the next step.</StageDescription>
              <ChoiceList role="radiogroup" aria-label="Payment method">
                {PAYMENT_CHOICES.map((choice) => (
                  <ChoiceCard key={choice.method} $selected={choice.method === paymentMethod}>
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
            </>
          ) : null}

          {stage === 'payment_details' && paymentMethod === 'cod' ? (
            <>
              <StageTitle>Prepare for cash on delivery</StageTitle>
              <StageDescription>You can pay when your order arrives at the pinned delivery location.</StageDescription>
              <PaymentPanel>
                <WalletCards aria-hidden="true" />
                <div>
                  <StageDescription>Amount to prepare</StageDescription>
                  <PaymentAmount>{formatPhp(totals.totalCentavos)}</PaymentAmount>
                </div>
              </PaymentPanel>
              <Notice tone="info">Please have the displayed amount ready when the delivery arrives.</Notice>
            </>
          ) : null}

          {stage === 'payment_details' && paymentMethod === 'gcash' ? (
            <>
              <StageTitle>Complete your GCash payment</StageTitle>
              <StageDescription>Send the exact total, then upload a clear screenshot so the payment can be reviewed.</StageDescription>
              <PaymentPanel>
                <Smartphone aria-hidden="true" />
                <div>
                  <StageDescription>Amount to send</StageDescription>
                  <PaymentAmount>{formatPhp(totals.totalCentavos)}</PaymentAmount>
                </div>
              </PaymentPanel>
              <UploadArea>
                <StageDescription>Upload a PNG, JPG, or WebP screenshot up to 5 MB.</StageDescription>
                <UploadButton component="label" variant="outlined">
                  {proofImageDataUrl ? 'Replace screenshot' : 'Choose payment screenshot'}
                  <HiddenFileInput
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(event) => handleProofUpload(event.target.files?.[0])}
                    type="file"
                  />
                </UploadButton>
                {proofImageDataUrl ? (
                  <>
                    <ProofPreview alt="GCash payment screenshot preview" src={proofImageDataUrl} />
                    <StageDescription>{proofFileName}</StageDescription>
                    <SecondaryButton
                      onClick={() => {
                        setProofImageDataUrl('');
                        setProofFileName('');
                      }}
                      type="button"
                    >
                      Remove screenshot
                    </SecondaryButton>
                  </>
                ) : null}
              </UploadArea>
            </>
          ) : null}

          {stage === 'review' ? (
            <>
              <StageTitle>Review your order</StageTitle>
              <StageDescription>Confirm the items, delivery point, schedule, and payment method before placing the order.</StageDescription>
              <ReviewList>
                {lines.map(({ cartItem, product }) => (
                  <ReviewItem key={product.id}>
                    <ReviewLabel>{product.name} × {cartItem.quantity}</ReviewLabel>
                    <ReviewValue>{formatPhp(product.priceCentavos * cartItem.quantity)}</ReviewValue>
                  </ReviewItem>
                ))}
                <ReviewItem>
                  <ReviewLabel>Deliver to</ReviewLabel>
                  <ReviewValue>{deliveryForm.addressLine}, {deliveryForm.area}</ReviewValue>
                </ReviewItem>
                <ReviewItem>
                  <ReviewLabel>Distance</ReviewLabel>
                  <ReviewValue>{pinLocation?.distanceKm.toFixed(2)} km</ReviewValue>
                </ReviewItem>
                <ReviewItem>
                  <ReviewLabel>Schedule</ReviewLabel>
                  <ReviewValue>{selectedSchedule.date}, {selectedSchedule.windowLabel}</ReviewValue>
                </ReviewItem>
                <ReviewItem>
                  <ReviewLabel>Payment</ReviewLabel>
                  <ReviewValue>{paymentMethod === 'cod' ? 'Cash on delivery' : 'GCash, screenshot submitted'}</ReviewValue>
                </ReviewItem>
              </ReviewList>
            </>
          ) : null}

          <Actions>
            {stage === 'location' ? <span /> : <SecondaryButton onClick={previousStage}>Back</SecondaryButton>}
            {stage === 'review' ? (
              <PrimaryButton disabled={placing} onClick={submitOrder} variant="contained">
                {placing ? 'Placing order…' : 'Place order'}
              </PrimaryButton>
            ) : (
              <PrimaryButton
                disabled={hasAvailabilityIssue || (stage === 'location' && !locationComplete)}
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
            <SummaryRow><dt>Delivery</dt><dd>{deliveryQuote?.serviceable ? formatPhp(totals.deliveryFeeCentavos) : 'Select pin'}</dd></SummaryRow>
            <SummaryTotal><dt>Total</dt><dd>{formatPhp(totals.totalCentavos)}</dd></SummaryTotal>
          </SummaryList>
          {deliveryQuote ? <Notice tone={deliveryQuote.serviceable ? 'info' : 'warning'}>{deliveryQuote.label}</Notice> : null}
          <FinePrint>Estimated loyalty after delivery: {pointsPending} points.</FinePrint>
        </SummaryPanel>
      </CheckoutLayout>

      <PaymentNoticeDialog
        aria-describedby="gcash-payment-notice-description"
        aria-labelledby="gcash-payment-notice-title"
        onClose={() => setPaymentNoticeOpen(false)}
        open={paymentNoticeOpen}
      >
        <PaymentNoticeTitle id="gcash-payment-notice-title">Before sending your payment</PaymentNoticeTitle>
        <PaymentNoticeContent id="gcash-payment-notice-description">
          Please make sure your screenshot clearly shows the amount, date, and reference number. We’ll review it before confirming your payment.
        </PaymentNoticeContent>
        <PaymentNoticeActions>
          <SecondaryButton onClick={() => setPaymentNoticeOpen(false)}>Go back</SecondaryButton>
          <PrimaryButton
            onClick={() => {
              setPaymentNoticeOpen(false);
              setStage('payment_details');
            }}
            variant="contained"
          >
            I understand
          </PrimaryButton>
        </PaymentNoticeActions>
      </PaymentNoticeDialog>
    </CheckoutPage>
  );
}

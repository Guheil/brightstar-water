'use client';

import { useRouter } from 'next/navigation';
import { Smartphone, ShoppingBasket, WalletCards } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EmptyState, LoadingState, Notice } from '@/components';
import AddressEditorDialog from '@/components/customer/AddressEditorDialog';
import AddressSelector from '@/components/customer/AddressSelector';
import { fetchPublicCatalog } from '@/lib/catalog/client';
import { fetchOperationalSnapshot, placeCustomerOrder } from '@/lib/orders/client';
import { useAppStore } from '@/store';
import type { PaymentMethod } from '@/types';
import {
  calculateCartSubtotal,
  calculateDeliveryFee,
  calculateLoyaltyPoints,
  calculateOrderTotals,
  buildDeliverySchedule,
  calculateEstimatedDelivery,
  formatDeliveryDate,
  formatPhp,
  getAvailablePreferredWindows,
  getAvailableStock,
  getPreferredDateBounds,
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
  EstimateLabel,
  EstimatePanel,
  EstimateValue,
  FinePrint,
  Header,
  HiddenFileInput,
  Lead,
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
  ScheduleField,
  ScheduleFields,
  ScheduleMenuItem,
  SchedulePreferencePanel,
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
  CheckoutPlacementPhase,
  CheckoutPlacementProgress,
  CheckoutStage,
  CheckoutStageDefinition,
  PaymentChoice,
} from './interface';

const STAGES: readonly CheckoutStageDefinition[] = [
  { id: 'location', label: 'Location' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'payment', label: 'Payment' },
  { id: 'payment_details', label: 'Payment details' },
  { id: 'review', label: 'Review' },
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

const PLACEMENT_PROGRESS: Readonly<Record<CheckoutPlacementPhase, CheckoutPlacementProgress>> = {
  creating_order: {
    label: 'Creating your order',
    description: 'We are reserving your items and saving your delivery details.',
  },
  refreshing_order_data: {
    label: 'Updating your order history',
    description: 'Your order is received. We are loading the latest confirmation details.',
  },
  opening_confirmation: {
    label: 'Opening your confirmation',
    description: 'Your order is ready. Taking you to the confirmation page now.',
  },
};

const allowedProofTypes = new Set(['image/png', 'image/jpeg', 'image/webp']);
const maxProofBytes = 5 * 1024 * 1024;

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, clearCart, setLastPlacedOrderId } = useCustomerCart();
  const customerId = useAppStore(getActiveCustomerId);
  const customers = useAppStore((state) => state.customers.records);
  const products = useAppStore((state) => state.catalog.products);
  const catalogInitialized = useAppStore((state) => state.catalog.initialized);
  const catalogError = useAppStore((state) => state.catalog.error);
  const inventory = useAppStore((state) => state.inventory.items);
  const syncCatalogSnapshot = useAppStore((state) => state.commands.syncCatalogSnapshot);
  const syncOperationalSnapshot = useAppStore((state) => state.commands.syncOperationalSnapshot);
  const syncCustomerAddresses = useAppStore((state) => state.commands.syncCustomerAddresses);
  const addressesInitialized = useAppStore((state) => state.customers.addressesInitialized);
  const addressesError = useAppStore((state) => state.customers.addressesError);
  const customer = customers.find((item) => item.id === customerId);
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
  const [scheduleMode, setScheduleMode] = useState<'earliest_available' | 'preferred'>('earliest_available');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredWindowId, setPreferredWindowId] = useState<'any' | 'morning' | 'afternoon'>('any');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [customerNote, setCustomerNote] = useState('');
  const [deliveryAddressId, setDeliveryAddressId] = useState('');
  const [addressEditorOpen, setAddressEditorOpen] = useState(false);
  const [paymentNoticeOpen, setPaymentNoticeOpen] = useState(false);
  const [proofImageDataUrl, setProofImageDataUrl] = useState('');
  const [proofFileName, setProofFileName] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [placementPhase, setPlacementPhase] = useState<CheckoutPlacementPhase | null>(null);
  const [error, setError] = useState<string | null>(null);
  const placing = placementPhase !== null;
  const placementProgress = placementPhase ? PLACEMENT_PROGRESS[placementPhase] : null;

  const fallbackDeliveryAddressId = customer?.addresses.find((address) => address.isDefault)?.id
    ?? customer?.addresses[0]?.id
    ?? '';
  const selectedDeliveryAddressId = deliveryAddressId || fallbackDeliveryAddressId;
  const selectedAddress = customer?.addresses.find((address) => address.id === selectedDeliveryAddressId) ?? null;
  const deliveryEstimate = useMemo(
    () => calculateEstimatedDelivery(selectedAddress?.distanceKm ?? 0),
    [selectedAddress?.distanceKm],
  );
  const preferredDateBounds = useMemo(
    () => getPreferredDateBounds(deliveryEstimate.date),
    [deliveryEstimate.date],
  );
  const selectedPreferredDate = scheduleMode === 'preferred'
    ? preferredDate || deliveryEstimate.date
    : preferredDate;
  const availablePreferredWindows = useMemo(
    () => getAvailablePreferredWindows(selectedPreferredDate || deliveryEstimate.date, deliveryEstimate),
    [deliveryEstimate, selectedPreferredDate],
  );
  const selectedPreferredWindowId = availablePreferredWindows.some(
    (window) => window.id === preferredWindowId,
  )
    ? preferredWindowId
    : 'any';
  const selectedSchedule = useMemo(
    () => buildDeliverySchedule({
      estimate: deliveryEstimate,
      preferredDate: scheduleMode === 'preferred' ? selectedPreferredDate : undefined,
      preferredWindowId: scheduleMode === 'preferred' ? selectedPreferredWindowId : undefined,
    }),
    [deliveryEstimate, scheduleMode, selectedPreferredDate, selectedPreferredWindowId],
  );
  const deliveryQuote = selectedAddress ? calculateDeliveryFee(selectedAddress.distanceKm) : null;
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
  const locationComplete = Boolean(selectedAddress && deliveryQuote?.serviceable);

  if (!catalogInitialized) {
    return (
      <CheckoutPage>
        <EmptyState
          action={<BackLink href="/customer/cart">Return to cart</BackLink>}
          description="Current products and inventory are loading from the database."
          icon={<ShoppingBasket />}
          title="Preparing checkout"
        />
      </CheckoutPage>
    );
  }

  if (catalogError) {
    return (
      <CheckoutPage>
        <EmptyState
          action={<BackLink href="/customer/cart">Return to cart</BackLink>}
          description={catalogError}
          icon={<ShoppingBasket />}
          title="Catalog unavailable"
        />
      </CheckoutPage>
    );
  }

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

  const nextStage = () => {
    setError(null);
    if (stage === 'location') {
      if (!selectedAddress || !deliveryQuote?.serviceable) {
        setError('Choose a saved delivery address before continuing.');
        return;
      }
      setStage('schedule');
      return;
    }
    if (stage === 'schedule') {
      if (scheduleMode === 'preferred') {
        if (!selectedPreferredDate || selectedPreferredDate < preferredDateBounds.min || selectedPreferredDate > preferredDateBounds.max) {
          setError('Choose an available preferred delivery date.');
          return;
        }
        if (selectedPreferredWindowId !== 'any' && !availablePreferredWindows.some((window) => window.id === selectedPreferredWindowId)) {
          setError('Choose a time window that is still available for that date.');
          return;
        }
      }
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
      setProofFile(file);
      setProofImageDataUrl(reader.result);
    };
    reader.onerror = () => setError('That screenshot could not be read. Choose another image.');
    reader.readAsDataURL(file);
  };

  const submitOrder = async () => {
    if (hasAvailabilityIssue) {
      setError('Return to your cart and adjust products that no longer have enough stock.');
      return;
    }
    if (!selectedDeliveryAddressId || !deliveryQuote?.serviceable) {
      setError('Confirm your delivery location before placing the order.');
      return;
    }
    if (paymentMethod === 'gcash' && !proofFile) {
      setError('Upload your GCash payment screenshot before placing the order.');
      return;
    }
    setPlacementPhase('creating_order');
    setError(null);
    const stableKey = idempotencyKey || globalThis.crypto.randomUUID();
    if (!idempotencyKey) setIdempotencyKey(stableKey);

    try {
      const result = await placeCustomerOrder({
        items: lines.map(({ cartItem, product }) => ({
          productId: product.id,
          quantity: cartItem.quantity,
        })),
        deliveryAddressId: selectedDeliveryAddressId,
        deliverySchedule: selectedSchedule,
        paymentMethod,
        ...(customerNote.trim() ? { customerNote: customerNote.trim() } : {}),
        idempotencyKey: stableKey,
      }, paymentMethod === 'gcash' ? proofFile : null);

      setPlacementPhase('refreshing_order_data');
      const [operations, catalog] = await Promise.all([
        fetchOperationalSnapshot(),
        fetchPublicCatalog(),
      ]);
      syncOperationalSnapshot(operations);
      syncCatalogSnapshot(catalog);
      clearCart();
      setLastPlacedOrderId(result.orderId);
      setPlacementPhase('opening_confirmation');
      router.push(`/customer/orders/${result.orderId}/confirmation`);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'The order could not be placed.');
      setPlacementPhase(null);
    }
  };

  return (
    <CheckoutPage>
      <Header>
        <BackLink href="/customer/cart">Back to cart</BackLink>
        <Title>Checkout</Title>
        <Lead>Set the delivery point, review the estimated arrival, choose an optional delivery preference and payment method, then confirm your order.</Lead>
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
        <StagePanel aria-busy={placing}>
          {error ? <Notice tone="error" title="Could not continue">{error}</Notice> : null}
          {hasAvailabilityIssue ? (
            <Notice tone="warning" title="Cart availability changed">
              {hasMissingProduct ? 'A product in your cart is no longer available. ' : ''}
              {stockIssues.map(({ product, availableStock }) => `${product.name} has ${availableStock} available.`).join(' ')}
            </Notice>
          ) : null}

          {stage === 'location' ? (
            <>
              <StageTitle>Choose a delivery address</StageTitle>
              <StageDescription>Select one of your saved locations. Add another address here without leaving checkout.</StageDescription>
              {!addressesInitialized ? <Notice tone="info">Loading your saved delivery addresses...</Notice> : null}
              {addressesError ? <Notice tone="error" title="Saved addresses unavailable">{addressesError} Refresh the page before continuing to checkout.</Notice> : null}
              {addressesInitialized && !addressesError && customer.addresses.length ? (
                <>
                  <AddressSelector addresses={customer.addresses} onSelect={setDeliveryAddressId} selectedId={selectedDeliveryAddressId} />
                  <SecondaryButton onClick={() => setAddressEditorOpen(true)} type="button" variant="outlined">Add another address</SecondaryButton>
                </>
              ) : null}
              {addressesInitialized && !addressesError && customer.addresses.length === 0 ? (
                <Notice tone="warning" title="Add a delivery address">
                  Save a Home, Work, or other address and pin the exact delivery point before continuing.
                </Notice>
              ) : null}
              {addressesInitialized && !addressesError && customer.addresses.length === 0 ? (
                <PrimaryButton onClick={() => setAddressEditorOpen(true)} type="button" variant="contained">Add delivery address</PrimaryButton>
              ) : null}
              {selectedAddress && deliveryQuote ? (
                <Notice tone={deliveryQuote.serviceable ? 'info' : 'warning'}>
                  {selectedAddress.distanceKm.toFixed(2)} km from the service point. {deliveryQuote.label}
                </Notice>
              ) : null}
            </>
          ) : null}

          {stage === 'schedule' ? (
            <>
              <StageTitle>Delivery timing</StageTitle>
              <StageDescription>
                Your estimated arrival is shown first. A preferred delivery date is optional.
              </StageDescription>

              <EstimatePanel aria-label="Estimated delivery arrival">
                <EstimateLabel>Estimated arrival</EstimateLabel>
                <EstimateValue>{formatDeliveryDate(deliveryEstimate.date)}</EstimateValue>
                <StageDescription>{deliveryEstimate.windowLabel}</StageDescription>
                <FinePrint>Based on your saved delivery location and current preparation time.</FinePrint>
              </EstimatePanel>

              <SchedulePreferencePanel>
                <StageDescription>Preferred delivery schedule · Optional</StageDescription>
                <ChoiceList role="radiogroup" aria-label="Preferred delivery schedule">
                  <ChoiceCard $selected={scheduleMode === 'earliest_available'}>
                    <ChoiceRadio
                      checked={scheduleMode === 'earliest_available'}
                      name="delivery-schedule-mode"
                      onChange={() => setScheduleMode('earliest_available')}
                      value="earliest_available"
                    />
                    <ChoiceCopy>
                      <ChoiceTitle>Earliest available delivery</ChoiceTitle>
                      <ChoiceDescription>No preferred date. We will use the earliest available delivery window.</ChoiceDescription>
                    </ChoiceCopy>
                  </ChoiceCard>
                  <ChoiceCard $selected={scheduleMode === 'preferred'}>
                    <ChoiceRadio
                      checked={scheduleMode === 'preferred'}
                      name="delivery-schedule-mode"
                      onChange={() => {
                        setScheduleMode('preferred');
                        setPreferredDate((current) => current || deliveryEstimate.date);
                      }}
                      value="preferred"
                    />
                    <ChoiceCopy>
                      <ChoiceTitle>I prefer a specific delivery date</ChoiceTitle>
                      <ChoiceDescription>Request a date and optionally choose a time window.</ChoiceDescription>
                    </ChoiceCopy>
                  </ChoiceCard>
                </ChoiceList>

                {scheduleMode === 'preferred' ? (
                  <ScheduleFields>
                    <ScheduleField
                      helperText={`Available from ${formatDeliveryDate(preferredDateBounds.min)} through ${formatDeliveryDate(preferredDateBounds.max)}.`}
                      slotProps={{ htmlInput: { min: preferredDateBounds.min, max: preferredDateBounds.max } }}
                      label="Preferred delivery date"
                      onChange={(event) => setPreferredDate(event.target.value)}
                      type="date"
                      value={selectedPreferredDate}
                    />
                    <ScheduleField
                      label="Preferred time (optional)"
                      onChange={(event) => setPreferredWindowId(event.target.value as 'any' | 'morning' | 'afternoon')}
                      select
                      value={selectedPreferredWindowId}
                    >
                      <ScheduleMenuItem value="any">Any available time</ScheduleMenuItem>
                      {availablePreferredWindows.map((window) => (
                        <ScheduleMenuItem key={window.id} value={window.id}>{window.label}</ScheduleMenuItem>
                      ))}
                    </ScheduleField>
                  </ScheduleFields>
                ) : null}
              </SchedulePreferencePanel>

              <Notice tone="info">
                Estimated arrival begins after the order is confirmed. GCash orders may require payment verification before processing.
              </Notice>

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
              <StageDescription>Confirm the items, delivery point, delivery timing, and payment method before placing the order.</StageDescription>
              <ReviewList>
                {lines.map(({ cartItem, product }) => (
                  <ReviewItem key={product.id}>
                    <ReviewLabel>{product.name} × {cartItem.quantity}</ReviewLabel>
                    <ReviewValue>{formatPhp(product.priceCentavos * cartItem.quantity)}</ReviewValue>
                  </ReviewItem>
                ))}
                <ReviewItem>
                  <ReviewLabel>Deliver to</ReviewLabel>
                  <ReviewValue>{selectedAddress ? `${selectedAddress.addressLine}, ${selectedAddress.area}` : 'No address selected'}</ReviewValue>
                </ReviewItem>
                <ReviewItem>
                  <ReviewLabel>Distance</ReviewLabel>
                  <ReviewValue>{selectedAddress ? `${selectedAddress.distanceKm.toFixed(2)} km` : 'Not available'}</ReviewValue>
                </ReviewItem>
                <ReviewItem>
                  <ReviewLabel>Estimated arrival</ReviewLabel>
                  <ReviewValue>{formatDeliveryDate(deliveryEstimate.date)} · {deliveryEstimate.windowLabel}</ReviewValue>
                </ReviewItem>
                <ReviewItem>
                  <ReviewLabel>Delivery preference</ReviewLabel>
                  <ReviewValue>
                    {scheduleMode === 'preferred'
                      ? `${formatDeliveryDate(selectedSchedule.preferredDate ?? selectedSchedule.date)} · ${selectedSchedule.preferredWindowLabel ?? selectedSchedule.windowLabel}`
                      : 'Earliest available'}
                  </ReviewValue>
                </ReviewItem>
                <ReviewItem>
                  <ReviewLabel>Payment</ReviewLabel>
                  <ReviewValue>{paymentMethod === 'cod' ? 'Cash on delivery' : 'GCash, screenshot submitted'}</ReviewValue>
                </ReviewItem>
              </ReviewList>
            </>
          ) : null}

          {placementProgress ? (
            <LoadingState
              compact
              description={placementProgress.description}
              label={placementProgress.label}
            />
          ) : null}

          <Actions>
            {stage === 'location' ? <span /> : <SecondaryButton disabled={placing} onClick={previousStage}>Back</SecondaryButton>}
            {stage === 'review' ? (
              <PrimaryButton disabled={placing} onClick={() => void submitOrder()} variant="contained">
                {placing ? 'Placing order…' : 'Place order'}
              </PrimaryButton>
            ) : (
              <PrimaryButton
                disabled={placing || hasAvailabilityIssue || (stage === 'location' && !locationComplete)}
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
            <SummaryRow><dt>Delivery</dt><dd>{deliveryQuote?.serviceable ? formatPhp(totals.deliveryFeeCentavos) : 'Select address'}</dd></SummaryRow>
            <SummaryTotal><dt>Total</dt><dd>{formatPhp(totals.totalCentavos)}</dd></SummaryTotal>
          </SummaryList>
          {deliveryQuote ? <Notice tone={deliveryQuote.serviceable ? 'info' : 'warning'}>{deliveryQuote.label}</Notice> : null}
          <FinePrint>Estimated loyalty after delivery: {pointsPending} points.</FinePrint>
        </SummaryPanel>
      </CheckoutLayout>

      <AddressEditorDialog
        initialPhone={customer.phonePlaceholder}
        initialRecipientName={customer.displayName}
        onClose={() => setAddressEditorOpen(false)}
        onSaved={(addresses, saved) => {
          syncCustomerAddresses(customerId, addresses);
          setDeliveryAddressId(saved.id);
          setAddressEditorOpen(false);
        }}
        open={addressEditorOpen}
      />

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

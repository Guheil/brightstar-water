'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Clipboard, MapPin, Phone } from 'lucide-react';
import DelivererShell from '@/components/layout/DelivererShell';
import Notice from '@/components/ui/Notice';
import StatusText from '@/components/ui/StatusText';
import { selectDeliveryById, selectOrderById, selectPaymentForOrder, useAppStore } from '@/store';
import { formatPhp } from '@/utils';
import { currentDelivererId, delivererNavigation } from '../_shared/delivererNavigation';
import {
  ActionButton,
  ActionCopy,
  ActionPanel,
  ActionTitle,
  CashField,
  Column,
  DeliveryHero,
  DeliveryNote,
  DetailGrid,
  FailureLink,
  HeroAmount,
  HeroAmountLabel,
  HeroAmountValue,
  HeroMeta,
  HeroReference,
  Item,
  Items,
  NoteField,
  ProofPreview,
  Result,
  Root,
  Section,
  SectionTitle,
  Strong,
  Text,
  UploadInput,
  UploadLabel,
  UtilityActions,
  UtilityButton,
  UtilityLink,
} from './elements';
import type { DeliveryDetailScreenProps } from './interface';

const DeliveryMap = dynamic(() => import('../DeliveryMap'), { ssr: false });
const MAX_PROOF_SIZE = 5 * 1024 * 1024;
const PROOF_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

export default function DeliveryDetailScreen({ deliveryId }: DeliveryDetailScreenProps) {
  const delivery = useAppStore(selectDeliveryById(deliveryId));
  const order = useAppStore(selectOrderById(delivery?.orderId ?? ''));
  const payment = useAppStore(selectPaymentForOrder(delivery?.orderId ?? ''));
  const commands = useAppStore((state) => state.commands);
  const [message, setMessage] = useState('');
  const [cashReceived, setCashReceived] = useState('');
  const [completionNote, setCompletionNote] = useState('');
  const [proofImage, setProofImage] = useState('');
  const [proofFileName, setProofFileName] = useState('');

  if (!delivery || !order) {
    return (
      <DelivererShell
        brandName="MRJE + Bright Star"
        navigation={delivererNavigation}
        headerTitle="Delivery unavailable"
      >
        <Notice tone="error" title="Delivery not found">
          This assignment is no longer available.
        </Notice>
      </DelivererShell>
    );
  }

  const customerAddress = [
    delivery.address.addressLine,
    delivery.address.area,
    delivery.address.municipality,
    delivery.address.province,
  ].join(', ');
  const directionsQuery =
    delivery.address.latitude != null && delivery.address.longitude != null
      ? `${delivery.address.latitude},${delivery.address.longitude}`
      : customerAddress;
  const directionsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(directionsQuery)}`;
  const categories = new Set(order.items.map((item) => item.category));
  const tone = categories.size > 1 ? 'mixed' : categories.has('gas') ? 'gas' : 'water';

  const run = (action: 'accept' | 'start') => {
    const result =
      action === 'accept'
        ? commands.acceptDelivery(delivery.id, currentDelivererId)
        : commands.startDelivery(delivery.id, currentDelivererId);
    setMessage(result.ok ? 'Delivery state updated.' : result.error.message);
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(customerAddress);
      setMessage('Delivery address copied.');
    } catch {
      setMessage('The address could not be copied on this device.');
    }
  };

  const handleProof = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!PROOF_TYPES.has(file.type)) {
      setMessage('Choose a PNG, JPG, or WebP delivery photo.');
      return;
    }
    if (file.size > MAX_PROOF_SIZE) {
      setMessage('Choose a delivery photo smaller than 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string' || !reader.result.startsWith('data:image/')) {
        setMessage('The delivery photo could not be read.');
        return;
      }
      setProofImage(reader.result);
      setProofFileName(file.name);
      setMessage('Delivery photo attached.');
    };
    reader.readAsDataURL(file);
  };

  const complete = () => {
    let cashReceivedCentavos: number | undefined;
    if (delivery.paymentMethod === 'cod') {
      const pesos = Number(cashReceived);
      if (!Number.isFinite(pesos) || pesos < 0) {
        setMessage('Enter the cash amount received before completing the delivery.');
        return;
      }
      cashReceivedCentavos = Math.round(pesos * 100);
      if (cashReceivedCentavos !== delivery.amountToCollectCentavos) {
        setMessage(`Confirm the exact ${formatPhp(delivery.amountToCollectCentavos)} collected for this order.`);
        return;
      }
    }

    const evidence = commands.recordDeliveryCompletion({
      deliveryId: delivery.id,
      delivererId: currentDelivererId,
      ...(cashReceivedCentavos != null ? { cashReceivedCentavos } : {}),
      ...(proofImage ? { proofImageDataUrl: proofImage, proofFileName } : {}),
      ...(completionNote.trim() ? { note: completionNote.trim() } : {}),
    });
    if (!evidence.ok) {
      setMessage(evidence.error.message);
      return;
    }
    const result = commands.completeDelivery(delivery.id, currentDelivererId);
    setMessage(result.ok ? 'Delivery completed successfully.' : result.error.message);
  };

  return (
    <DelivererShell
      brandName="MRJE + Bright Star"
      navigation={delivererNavigation}
      activeHref="/deliverer/deliveries"
      headerTitle={order.reference}
      headerMeta={`${delivery.schedule.date} · ${delivery.schedule.windowLabel}`}
    >
      <Root>
        <DeliveryHero $tone={tone}>
          <div>
            <HeroReference>{delivery.address.recipientName}</HeroReference>
            <HeroMeta>{tone === 'gas' ? 'MRJE Gas' : tone === 'water' ? 'Bright Star Water' : 'Mixed storefront order'}</HeroMeta>
            <HeroMeta>{delivery.address.area} · {delivery.address.distanceKm.toFixed(1)} km</HeroMeta>
            <HeroMeta>{delivery.schedule.windowLabel}</HeroMeta>
          </div>
          <HeroAmount>
            <HeroAmountValue>
              {delivery.paymentMethod === 'cod'
                ? formatPhp(delivery.amountToCollectCentavos)
                : 'GCash'}
            </HeroAmountValue>
            <HeroAmountLabel>
              {delivery.paymentMethod === 'cod' ? 'cash to collect' : 'payment handled by Admin'}
            </HeroAmountLabel>
          </HeroAmount>
        </DeliveryHero>

        <DetailGrid>
          <Column>
            <Section aria-labelledby="delivery-address-title">
              <SectionTitle id="delivery-address-title">Deliver to</SectionTitle>
              <Strong>{delivery.address.recipientName}</Strong>
              <Text>{delivery.address.phonePlaceholder}</Text>
              <Text>{customerAddress}</Text>
              <UtilityActions>
                <UtilityLink href={`tel:${delivery.address.phonePlaceholder}`}>
                  <Phone aria-hidden="true" /> Call customer
                </UtilityLink>
                <UtilityLink href={directionsHref} rel="noreferrer" target="_blank">
                  <MapPin aria-hidden="true" /> Directions
                </UtilityLink>
                <UtilityButton onClick={copyAddress} startIcon={<Clipboard aria-hidden="true" />} variant="outlined">
                  Copy address
                </UtilityButton>
              </UtilityActions>
              {delivery.address.deliveryNote ? (
                <DeliveryNote>
                  <Strong>Delivery note</Strong>
                  <Text>{delivery.address.deliveryNote}</Text>
                </DeliveryNote>
              ) : null}
            </Section>

            {delivery.address.latitude != null && delivery.address.longitude != null ? (
              <Section aria-labelledby="delivery-map-title">
                <SectionTitle id="delivery-map-title">Delivery pin</SectionTitle>
                <DeliveryMap latitude={delivery.address.latitude} longitude={delivery.address.longitude} />
              </Section>
            ) : null}

            <Section aria-labelledby="delivery-items-title">
              <SectionTitle id="delivery-items-title">Order items</SectionTitle>
              <Items>
                {order.items.map((item) => (
                  <Item key={item.productId}>
                    <Text>{item.name}</Text>
                    <Strong>× {item.quantity}</Strong>
                  </Item>
                ))}
              </Items>
            </Section>

            <Section aria-labelledby="delivery-payment-title">
              <SectionTitle id="delivery-payment-title">Payment</SectionTitle>
              <Strong>{delivery.paymentMethod === 'cod' ? 'Cash on delivery' : 'GCash'}</Strong>
              <Text>
                {delivery.paymentMethod === 'cod'
                  ? `${formatPhp(delivery.amountToCollectCentavos)} should be collected at the stop.`
                  : payment?.status === 'verified' || payment?.status === 'paid'
                    ? 'Admin has reviewed the payment.'
                    : `Payment review: ${payment?.status.replaceAll('_', ' ') ?? 'unavailable'}`}
              </Text>
            </Section>
          </Column>

          <ActionPanel>
            <ActionTitle>Delivery progress</ActionTitle>
            <StatusText tone={delivery.status === 'delivered' ? 'success' : 'info'}>
              {delivery.status.replaceAll('_', ' ')}
            </StatusText>
            {delivery.status === 'assigned' ? (
              <ActionButton onClick={() => run('accept')}>Accept assignment</ActionButton>
            ) : null}
            {delivery.status === 'accepted' ? (
              <ActionButton onClick={() => run('start')}>Start delivery</ActionButton>
            ) : null}
            {delivery.status === 'out_for_delivery' ? (
              <>
                <ActionCopy>Confirm the collection and add delivery evidence before closing the stop.</ActionCopy>
                {delivery.paymentMethod === 'cod' ? (
                  <CashField
                    label="Cash received"
                    onChange={(event) => setCashReceived(event.target.value)}
                    slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                    type="number"
                    value={cashReceived}
                  />
                ) : null}
                <UploadLabel>
                  {proofFileName ? 'Replace delivery photo' : 'Add delivery photo'}
                  <UploadInput accept="image/png,image/jpeg,image/webp" capture="environment" onChange={handleProof} type="file" />
                </UploadLabel>
                {proofImage ? <ProofPreview alt="Delivery proof preview" src={proofImage} /> : null}
                <NoteField
                  label="Completion note"
                  multiline
                  minRows={2}
                  onChange={(event) => setCompletionNote(event.target.value)}
                  slotProps={{ htmlInput: { maxLength: 240 } }}
                  value={completionNote}
                />
                <ActionButton onClick={complete}>Complete delivery</ActionButton>
                <FailureLink href={`/deliverer/deliveries/${delivery.id}/report-failure`}>
                  Report unsuccessful delivery
                </FailureLink>
              </>
            ) : null}
            {delivery.completionEvidence?.proofImageDataUrl ? (
              <ActionCopy>Delivery photo and completion details are recorded.</ActionCopy>
            ) : null}
            {message ? <Result role="status">{message}</Result> : null}
          </ActionPanel>
        </DetailGrid>
      </Root>
    </DelivererShell>
  );
}

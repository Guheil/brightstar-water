'use client';

import { ActionButton, Actions, AddressCopy, Card, DefaultText, Header, Label, LabelGroup, Meta, Recipient } from './elements';
import type { AddressCardProps } from './interface';

export default function AddressCard({ address, busy = false, onDelete, onEdit, onSetDefault }: AddressCardProps) {
  const writtenAddress = [address.addressLine, address.area, address.municipality, address.province].filter(Boolean).join(', ');
  return (
    <Card>
      <Header>
        <LabelGroup>
          <Label>{address.label}</Label>
          {address.isDefault ? <DefaultText>Default delivery address</DefaultText> : null}
        </LabelGroup>
        <Meta>{address.distanceKm.toFixed(2)} km from service point</Meta>
      </Header>
      <Recipient>{address.recipientName} · {address.phonePlaceholder}</Recipient>
      <AddressCopy>{writtenAddress}</AddressCopy>
      {address.landmark ? <AddressCopy>Landmark: {address.landmark}</AddressCopy> : null}
      <Actions>
        <ActionButton disabled={busy} onClick={() => onEdit(address)} type="button" variant="outlined">Edit</ActionButton>
        {!address.isDefault ? <ActionButton disabled={busy} onClick={() => onSetDefault(address)} type="button" variant="outlined">Set as default</ActionButton> : null}
        <ActionButton disabled={busy} onClick={() => onDelete(address)} type="button" variant="text">Delete</ActionButton>
      </Actions>
    </Card>
  );
}

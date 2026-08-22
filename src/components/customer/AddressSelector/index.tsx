'use client';

import { calculateDeliveryFee } from '@/utils';
import { ChoiceRadio, Copy, Detail, Label, List, Meta, Option } from './elements';
import type { AddressSelectorProps } from './interface';

export default function AddressSelector({ addresses, selectedId, onSelect }: AddressSelectorProps) {
  return (
    <List role="radiogroup" aria-label="Saved delivery addresses">
      {addresses.map((address) => {
        const quote = calculateDeliveryFee(address.distanceKm);
        return (
          <Option $selected={selectedId === address.id} key={address.id}>
            <ChoiceRadio checked={selectedId === address.id} name="delivery-address" onChange={() => onSelect(address.id)} value={address.id} />
            <Copy>
              <Label>{address.label}{address.isDefault ? ' · Default' : ''}</Label>
              <Detail>{address.recipientName} · {address.phonePlaceholder}</Detail>
              <Detail>{[address.addressLine, address.area, address.municipality, address.province].filter(Boolean).join(', ')}</Detail>
              <Meta>{address.distanceKm.toFixed(2)} km · {quote.label}</Meta>
            </Copy>
          </Option>
        );
      })}
    </List>
  );
}

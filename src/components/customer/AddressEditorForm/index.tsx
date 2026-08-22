'use client';

import { useEffect, useMemo, useState } from 'react';
import { Notice } from '@/components';
import { calculateDeliveryFee } from '@/utils';
import { createCustomerAddress, fetchPsgcOptions, updateCustomerAddress } from '@/lib/addresses/client';
import type { AddressMutationInput, DeliveryAddressType, PsgcOption } from '@/lib/addresses/types';
import DeliveryPinMap from '@/screens/customer/DeliveryPinMap';
import type { DeliveryPinChange } from '@/screens/customer/DeliveryPinMap/interface';
import {
  Actions,
  Checkbox,
  DefaultChoice,
  Field,
  FieldGrid,
  FormRoot,
  FullField,
  InputLabel,
  MenuItem,
  PrimaryButton,
  SecondaryButton,
  Section,
  SectionCopy,
  SectionTitle,
  SelectControl,
  StyledSelect,
  TypeButton,
  TypeChoices,
} from './elements';
import type { AddressEditorFormProps } from './interface';

const EMPTY = '';

export default function AddressEditorForm({ initialAddress, initialRecipientName = '', initialPhone = '', onCancel, onSaved, submitLabel = 'Save address' }: AddressEditorFormProps) {
  const [addressType, setAddressType] = useState<DeliveryAddressType>(initialAddress?.addressType ?? 'home');
  const [customLabel, setCustomLabel] = useState(initialAddress?.customLabel ?? '');
  const [recipientName, setRecipientName] = useState(initialAddress?.recipientName ?? initialRecipientName);
  const [phone, setPhone] = useState(initialAddress?.phonePlaceholder ?? initialPhone);
  const [regionCode, setRegionCode] = useState(initialAddress?.regionCode ?? EMPTY);
  const [provinceCode, setProvinceCode] = useState(initialAddress?.provinceCode ?? EMPTY);
  const [municipalityCode, setMunicipalityCode] = useState(initialAddress?.municipalityCode ?? EMPTY);
  const [barangayCode, setBarangayCode] = useState(initialAddress?.barangayCode ?? EMPTY);
  const [addressLine, setAddressLine] = useState(initialAddress?.addressLine ?? '');
  const [landmark, setLandmark] = useState(initialAddress?.landmark ?? '');
  const [deliveryNote, setDeliveryNote] = useState(initialAddress?.deliveryNote ?? '');
  const [pin, setPin] = useState<DeliveryPinChange | null>(initialAddress?.latitude != null && initialAddress.longitude != null ? { latitude: initialAddress.latitude, longitude: initialAddress.longitude, distanceKm: initialAddress.distanceKm } : null);
  const [makeDefault, setMakeDefault] = useState(initialAddress?.isDefault ?? false);
  const [regions, setRegions] = useState<PsgcOption[]>([]);
  const [provinces, setProvinces] = useState<PsgcOption[]>([]);
  const [municipalities, setMunicipalities] = useState<PsgcOption[]>([]);
  const [barangays, setBarangays] = useState<PsgcOption[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([fetchPsgcOptions('regions'), fetchPsgcOptions('provinces')])
      .then(([nextRegions, nextProvinces]) => { if (active) { setRegions(nextRegions); setProvinces(nextProvinces); setLoadingLocations(false); } })
      .catch(() => { if (active) { setError('Location choices could not be loaded. Please try again.'); setLoadingLocations(false); } });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    const request = provinceCode
      ? fetchPsgcOptions('municipalities', { provinceCode })
      : Promise.resolve<PsgcOption[]>([]);
    void request
      .then((items) => { if (active) setMunicipalities(items); })
      .catch(() => { if (active) setMunicipalities([]); });
    return () => { active = false; };
  }, [provinceCode]);

  useEffect(() => {
    let active = true;
    const request = municipalityCode
      ? fetchPsgcOptions('barangays', { municipalityCode })
      : Promise.resolve<PsgcOption[]>([]);
    void request
      .then((items) => { if (active) setBarangays(items); })
      .catch(() => { if (active) setBarangays([]); });
    return () => { active = false; };
  }, [municipalityCode]);

  const province = provinces.find((item) => item.code === provinceCode);
  const municipality = municipalities.find((item) => item.code === municipalityCode);
  const barangay = barangays.find((item) => item.code === barangayCode);
  const effectiveRegionCode = regionCode || province?.regionCode || '';
  const region = regions.find((item) => item.code === effectiveRegionCode);
  const quote = pin ? calculateDeliveryFee(pin.distanceKm) : null;
  const initialCoordinate = useMemo(() => initialAddress?.latitude != null && initialAddress.longitude != null ? { latitude: initialAddress.latitude, longitude: initialAddress.longitude } : undefined, [initialAddress]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!pin || !quote?.serviceable) { setError('Place the delivery pin inside the current delivery area.'); return; }
    if (!province || !municipality || !barangay || !region) { setError('Choose the complete province, city or municipality, and barangay.'); return; }
    const input: AddressMutationInput = {
      addressType,
      ...(addressType === 'other' ? { customLabel: customLabel.trim() } : {}),
      recipientName: recipientName.trim(),
      phone: phone.trim(),
      regionCode: region.code,
      regionName: region.name,
      provinceCode: province.code,
      provinceName: province.name,
      municipalityCode: municipality.code,
      municipalityName: municipality.name,
      barangayCode: barangay.code,
      barangayName: barangay.name,
      addressLine: addressLine.trim(),
      ...(landmark.trim() ? { landmark: landmark.trim() } : {}),
      ...(deliveryNote.trim() ? { deliveryNote: deliveryNote.trim() } : {}),
      latitude: pin.latitude,
      longitude: pin.longitude,
      makeDefault,
    };
    setSaving(true);
    try {
      const response = initialAddress ? await updateCustomerAddress(initialAddress.id, input) : await createCustomerAddress(input);
      onSaved(response.addresses, response.address);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The address could not be saved.');
    } finally { setSaving(false); }
  };

  return (
    <FormRoot onSubmit={submit}>
      {error ? <Notice tone="error" title="Could not save address">{error}</Notice> : null}
      <Section>
        <SectionTitle>Address type</SectionTitle>
        <SectionCopy>Choose a familiar label so this address is easy to recognize during checkout.</SectionCopy>
        <TypeChoices role="radiogroup" aria-label="Address type">
          {(['home', 'work', 'other'] as const).map((type) => (
            <TypeButton aria-checked={addressType === type} role="radio" $selected={addressType === type} key={type} onClick={() => setAddressType(type)} type="button" variant="outlined">
              {type === 'home' ? 'Home' : type === 'work' ? 'Work' : 'Other'}
            </TypeButton>
          ))}
        </TypeChoices>
        {addressType === 'other' ? <Field label="Address label" onChange={(event) => setCustomLabel(event.target.value)} value={customLabel} /> : null}
      </Section>

      <Section>
        <SectionTitle>Recipient details</SectionTitle>
        <FieldGrid>
          <Field autoComplete="name" label="Recipient name" onChange={(event) => setRecipientName(event.target.value)} required value={recipientName} />
          <Field autoComplete="tel" inputMode="numeric" label="Mobile number" onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 11))} placeholder="09XXXXXXXXX" required value={phone} />
        </FieldGrid>
      </Section>

      <Section>
        <SectionTitle>Written address</SectionTitle>
        <FieldGrid>
          <SelectControl disabled={loadingLocations}>
            <InputLabel id="province-label">Province</InputLabel>
            <StyledSelect label="Province" labelId="province-label" onChange={(event) => { const value = String(event.target.value); const option = provinces.find((item) => item.code === value); setProvinceCode(value); setRegionCode(option?.regionCode ?? ''); setMunicipalityCode(''); setBarangayCode(''); }} value={provinceCode}>
              {provinces.map((item) => <MenuItem key={item.code} value={item.code}>{item.name}</MenuItem>)}
            </StyledSelect>
          </SelectControl>
          <SelectControl disabled={!provinceCode}>
            <InputLabel id="municipality-label">City or municipality</InputLabel>
            <StyledSelect label="City or municipality" labelId="municipality-label" onChange={(event) => { setMunicipalityCode(String(event.target.value)); setBarangayCode(''); }} value={municipalityCode}>
              {municipalities.map((item) => <MenuItem key={item.code} value={item.code}>{item.name}</MenuItem>)}
            </StyledSelect>
          </SelectControl>
          <SelectControl disabled={!municipalityCode}>
            <InputLabel id="barangay-label">Barangay</InputLabel>
            <StyledSelect label="Barangay" labelId="barangay-label" onChange={(event) => setBarangayCode(String(event.target.value))} value={barangayCode}>
              {barangays.map((item) => <MenuItem key={item.code} value={item.code}>{item.name}</MenuItem>)}
            </StyledSelect>
          </SelectControl>
          <FullField label="House, building, and street" onChange={(event) => setAddressLine(event.target.value)} required value={addressLine} />
          <FullField label="Landmark (optional)" onChange={(event) => setLandmark(event.target.value)} value={landmark} />
        </FieldGrid>
      </Section>

      <Section>
        <SectionTitle>Exact delivery location</SectionTitle>
        <SectionCopy>Place the pin at the entrance or handoff point where the delivery should arrive.</SectionCopy>
        <DeliveryPinMap initialCoordinate={initialCoordinate} onChange={setPin} reportInitial={Boolean(initialAddress)} />
        {pin && quote ? <Notice tone={quote.serviceable ? 'info' : 'warning'}>{pin.distanceKm.toFixed(2)} km from the service point. {quote.label}</Notice> : null}
        <FullField label="Delivery instructions (optional)" minRows={2} multiline onChange={(event) => setDeliveryNote(event.target.value)} value={deliveryNote} />
        <DefaultChoice control={<Checkbox checked={makeDefault} disabled={initialAddress?.isDefault} onChange={(event) => setMakeDefault(event.target.checked)} />} label={initialAddress?.isDefault ? 'This is your current default delivery address' : 'Make this my default delivery address'} />
      </Section>

      <Actions>
        {onCancel ? <SecondaryButton disabled={saving} onClick={onCancel} type="button" variant="outlined">Cancel</SecondaryButton> : null}
        <PrimaryButton disabled={saving || !quote?.serviceable} type="submit" variant="contained">{saving ? 'Saving...' : submitLabel}</PrimaryButton>
      </Actions>
    </FormRoot>
  );
}

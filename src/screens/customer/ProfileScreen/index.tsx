'use client';

import { useMemo, useState } from 'react';
import { EmptyState, Notice } from '@/components';
import { useAppStore } from '@/store';
import { getActiveCustomerId } from '../_shared/customer';
import {
  AddressItem,
  AddressList,
  AddressName,
  AddressSection,
  AddressText,
  BackLink,
  DistanceText,
  Field,
  FieldGrid,
  Form,
  FormActions,
  FormPanel,
  FullField,
  Header,
  Helper,
  Layout,
  Lead,
  ProfilePage,
  ResetButton,
  SaveButton,
  SectionTitle,
  Title,
} from './elements';
import type { ProfileFormValues } from './interface';

export default function ProfileScreen() {
  const customerId = useAppStore(getActiveCustomerId);
  const customers = useAppStore((state) => state.customers.records);
  const customer = customers.find((item) => item.id === customerId);
  const defaultAddress = customer?.addresses.find((address) => address.isDefault) ?? customer?.addresses[0];
  const initialValues = useMemo<ProfileFormValues>(
    () => ({
      displayName: customer?.displayName ?? '',
      email: customer?.email ?? '',
      phone: customer?.phonePlaceholder ?? '',
      addressLine: defaultAddress?.addressLine ?? '',
      area: defaultAddress?.area ?? '',
      municipality: defaultAddress?.municipality ?? '',
      deliveryNote: defaultAddress?.deliveryNote ?? '',
    }),
    [customer, defaultAddress],
  );
  const [values, setValues] = useState<ProfileFormValues>(initialValues);
  const [saved, setSaved] = useState(false);

  if (!customer) {
    return (
      <ProfilePage>
        <EmptyState
          description="Reset the demo workspace to restore fictional profile data."
          title="Profile unavailable"
        />
      </ProfilePage>
    );
  }

  const update = (field: keyof ProfileFormValues, value: string) => {
    setSaved(false);
    setValues((current) => ({ ...current, [field]: value }));
  };

  return (
    <ProfilePage>
      <Header>
        <BackLink href="/customer/account">Back to account</BackLink>
        <Title>Profile and saved delivery information</Title>
        <Lead>
          Review the fictional details used to calculate demo delivery zones and prepare orders.
        </Lead>
      </Header>

      <Layout>
        <AddressSection>
          <SectionTitle>Saved demo addresses</SectionTitle>
          <AddressList>
            {customer.addresses.map((address) => (
              <AddressItem key={address.id}>
                <AddressName>{address.label}</AddressName>
                <AddressText>{address.addressLine}</AddressText>
                <AddressText>
                  {address.municipality}, {address.province}
                </AddressText>
                <DistanceText>{address.distanceKm} km demo distance</DistanceText>
              </AddressItem>
            ))}
          </AddressList>
          <Helper>
            Distances are fixed presentation fixtures. The prototype does not use GPS or geocoding.
          </Helper>
        </AddressSection>

        <FormPanel>
          <SectionTitle>Edit presentation details</SectionTitle>
          {saved ? (
            <Notice title="Saved for this view" tone="success">
              Your changes are kept only while this page remains open. No real profile was updated.
            </Notice>
          ) : null}
          <Form
            onSubmit={(event) => {
              event.preventDefault();
              setSaved(true);
            }}
          >
            <FieldGrid>
              <Field
                autoComplete="name"
                label="Display name"
                onChange={(event) => update('displayName', event.target.value)}
                required
                value={values.displayName}
              />
              <Field
                autoComplete="tel"
                helperText="Use placeholder data only in this prototype."
                label="Contact placeholder"
                onChange={(event) => update('phone', event.target.value)}
                required
                value={values.phone}
              />
              <FullField
                autoComplete="email"
                label="Demo email"
                onChange={(event) => update('email', event.target.value)}
                required
                type="email"
                value={values.email}
              />
              <FullField
                autoComplete="street-address"
                label="Address line"
                onChange={(event) => update('addressLine', event.target.value)}
                required
                value={values.addressLine}
              />
              <Field
                label="Demo area"
                onChange={(event) => update('area', event.target.value)}
                required
                value={values.area}
              />
              <Field
                label="Municipality"
                onChange={(event) => update('municipality', event.target.value)}
                required
                value={values.municipality}
              />
              <FullField
                label="Delivery note"
                minRows={3}
                multiline
                onChange={(event) => update('deliveryNote', event.target.value)}
                value={values.deliveryNote}
              />
            </FieldGrid>
            <Helper>
              This form demonstrates validation and save feedback. It does not write to a backend.
            </Helper>
            <FormActions>
              <ResetButton
                onClick={() => {
                  setValues(initialValues);
                  setSaved(false);
                }}
                type="button"
              >
                Reset demo values
              </ResetButton>
              <SaveButton type="submit" variant="contained">
                Save presentation changes
              </SaveButton>
            </FormActions>
          </Form>
        </FormPanel>
      </Layout>
    </ProfilePage>
  );
}


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
          description="Refresh the page or sign in again to reload your profile."
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
          Review the contact and address details used to prepare your orders.
        </Lead>
      </Header>

      <Layout>
        <AddressSection>
          <SectionTitle>Saved delivery addresses</SectionTitle>
          <AddressList>
            {customer.addresses.map((address) => (
              <AddressItem key={address.id}>
                <AddressName>{address.label}</AddressName>
                <AddressText>{address.addressLine}</AddressText>
                <AddressText>
                  {address.municipality}, {address.province}
                </AddressText>
                <DistanceText>{address.distanceKm} km from the store</DistanceText>
              </AddressItem>
            ))}
          </AddressList>
          <Helper>
            Delivery fees are calculated using the listed distance for each saved address.
          </Helper>
        </AddressSection>

        <FormPanel>
          <SectionTitle>Edit profile details</SectionTitle>
          {saved ? (
            <Notice title="Profile details updated" tone="success">
              Your latest contact and delivery details are now displayed.
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
                helperText="Enter the number to use for delivery updates."
                label="Contact number"
                onChange={(event) => update('phone', event.target.value)}
                required
                value={values.phone}
              />
              <FullField
                autoComplete="email"
                label="Email"
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
                label="Area"
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
              Review your contact and delivery details before saving.
            </Helper>
            <FormActions>
              <ResetButton
                onClick={() => {
                  setValues(initialValues);
                  setSaved(false);
                }}
                type="button"
              >
                Reset changes
              </ResetButton>
              <SaveButton type="submit" variant="contained">
                Save changes
              </SaveButton>
            </FormActions>
          </Form>
        </FormPanel>
      </Layout>
    </ProfilePage>
  );
}

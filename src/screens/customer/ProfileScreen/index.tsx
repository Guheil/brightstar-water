'use client';

import { useMemo, useState } from 'react';
import { EmptyState, Notice } from '@/components';
import { useAppStore } from '@/store';
import { getActiveCustomerId } from '../_shared/customer';
import {
  AddressSection,
  BackLink,
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
  const initialValues = useMemo<ProfileFormValues>(
    () => ({
      displayName: customer?.displayName ?? '',
      email: customer?.email ?? '',
      phone: customer?.phonePlaceholder ?? '',
    }),
    [customer],
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
        <Title>Profile details</Title>
        <Lead>
          Review the contact details connected to your customer account.
        </Lead>
      </Header>

      <Layout>
        <AddressSection>
          <SectionTitle>Delivery addresses</SectionTitle>
          <Helper>Home, Work, and other delivery locations are managed separately so their map pins stay accurate.</Helper>
          <BackLink href="/customer/addresses">Manage saved delivery addresses</BackLink>
        </AddressSection>

        <FormPanel>
          <SectionTitle>Edit profile details</SectionTitle>
          {saved ? (
            <Notice title="Profile details updated" tone="success">
              Your latest profile details are now displayed.
            </Notice>
          ) : null}
          <Form
            onSubmit={(event) => {
              event.preventDefault();
              setSaved(true);
            }}
          >
            <FieldGrid>
              <Field autoComplete="name" label="Display name" onChange={(event) => update('displayName', event.target.value)} required value={values.displayName} />
              <Field autoComplete="tel" helperText="Enter the number to use for delivery updates." label="Contact number" onChange={(event) => update('phone', event.target.value)} required value={values.phone} />
              <FullField autoComplete="email" label="Email" onChange={(event) => update('email', event.target.value)} required type="email" value={values.email} />
            </FieldGrid>
            <Helper>
              Review your contact details before saving.
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

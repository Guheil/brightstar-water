'use client';

import { useEffect, useMemo, useState } from 'react';
import { EmptyState, Notice } from '@/components';
import { updateCustomerProfile } from '@/lib/profile/client';
import { customerProfileUpdateSchema } from '@/lib/profile/validation';
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
import type { ProfileFeedback, ProfileFormValues } from './interface';

export default function ProfileScreen() {
  const customerId = useAppStore(getActiveCustomerId);
  const customers = useAppStore((state) => state.customers.records);
  const syncCustomerProfile = useAppStore((state) => state.commands.syncCustomerProfile);
  const customer = customers.find((item) => item.id === customerId);
  const initialValues = useMemo<ProfileFormValues>(
    () => ({
      displayName: customer?.displayName ?? '',
      phone: customer?.phonePlaceholder ?? '',
    }),
    [customer?.displayName, customer?.phonePlaceholder],
  );
  const [values, setValues] = useState<ProfileFormValues>(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<ProfileFeedback | null>(null);

  useEffect(() => {
    if (!customer) return;
    setValues({
      displayName: customer.displayName,
      phone: customer.phonePlaceholder,
    });
  }, [customer?.displayName, customer?.id, customer?.phonePlaceholder]);

  if (!customer || !customerId) {
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
    setFeedback(null);
    setValues((current) => ({ ...current, [field]: value }));
  };

  const reset = () => {
    setValues({
      displayName: customer.displayName,
      phone: customer.phonePlaceholder,
    });
    setFeedback(null);
  };

  const hasChanges = values.displayName.trim() !== customer.displayName
    || values.phone.trim() !== customer.phonePlaceholder;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    const parsed = customerProfileUpdateSchema.safeParse({
      fullName: values.displayName,
      phone: values.phone,
    });
    if (!parsed.success) {
      setFeedback({
        message: parsed.error.issues[0]?.message ?? 'Check your profile details and try again.',
        title: 'Profile not updated',
        tone: 'error',
      });
      return;
    }

    setSubmitting(true);
    try {
      const result = await updateCustomerProfile(parsed.data);
      syncCustomerProfile({
        customerId: result.profile.id,
        displayName: result.profile.displayName,
        email: result.profile.email,
        phone: result.profile.phone,
        updatedAt: result.profile.updatedAt,
      });
      setValues({
        displayName: result.profile.displayName,
        phone: result.profile.phone,
      });
      setFeedback({
        message: 'Your latest profile details are now saved.',
        title: 'Profile details updated',
        tone: 'success',
      });
    } catch (error) {
      setFeedback({
        message: error instanceof Error
          ? error.message
          : 'Your profile could not be updated. Check your connection and try again.',
        title: 'Profile not updated',
        tone: 'error',
      });
    } finally {
      setSubmitting(false);
    }
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
          {feedback ? (
            <Notice title={feedback.title} tone={feedback.tone}>
              {feedback.message}
            </Notice>
          ) : null}
          <Form aria-busy={submitting} onSubmit={handleSubmit}>
            <FieldGrid>
              <Field
                autoComplete="name"
                disabled={submitting}
                label="Display name"
                onChange={(event) => update('displayName', event.target.value)}
                required
                value={values.displayName}
              />
              <Field
                autoComplete="tel"
                disabled={submitting}
                helperText="Use a Philippine mobile number in 09XXXXXXXXX format."
                label="Contact number"
                onChange={(event) => update('phone', event.target.value)}
                required
                value={values.phone}
              />
              <FullField
                autoComplete="email"
                disabled
                helperText="Used to sign in to your account."
                label="Login email"
                type="email"
                value={customer.email}
              />
            </FieldGrid>
            <Helper>
              Update your name or contact number, then save your changes.
            </Helper>
            <FormActions>
              <ResetButton
                disabled={submitting || !hasChanges}
                onClick={reset}
                type="button"
              >
                Reset changes
              </ResetButton>
              <SaveButton disabled={submitting || !hasChanges} type="submit" variant="contained">
                {submitting ? 'Saving…' : 'Save changes'}
              </SaveButton>
            </FormActions>
          </Form>
        </FormPanel>
      </Layout>
    </ProfilePage>
  );
}

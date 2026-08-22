'use client';

import { useRouter } from 'next/navigation';
import { EmptyState, Notice } from '@/components';
import AddressEditorForm from '@/components/customer/AddressEditorForm';
import { useAppStore } from '@/store';
import { getActiveCustomerId } from '../_shared/customer';
import { BackLink, FormShell, Header, Lead, Page, Title } from './elements';
import type { AddressEditorScreenProps } from './interface';

export default function AddressEditorScreen({ addressId }: AddressEditorScreenProps) {
  const router = useRouter();
  const customerId = useAppStore(getActiveCustomerId);
  const customer = useAppStore((state) => state.customers.records.find((item) => item.id === customerId));
  const initialized = useAppStore((state) => state.customers.addressesInitialized);
  const syncAddresses = useAppStore((state) => state.commands.syncCustomerAddresses);
  const address = addressId ? customer?.addresses.find((item) => item.id === addressId) : undefined;

  if (!customer) return <Page><EmptyState title="Customer account unavailable" description="Sign in again to manage delivery addresses." /></Page>;
  if (addressId && initialized && !address) return <Page><EmptyState title="Saved address not found" description="This address may have been removed." action={<BackLink href="/customer/addresses">Return to saved addresses</BackLink>} /></Page>;

  const editing = Boolean(addressId);
  return (
    <Page>
      <Header>
        <BackLink href="/customer/addresses">Back to saved addresses</BackLink>
        <Title>{editing ? 'Edit delivery address' : 'Add delivery address'}</Title>
        <Lead>{editing ? 'Update the written details or move the delivery pin if this location has changed.' : 'Save the written address and pin the exact point where your order should be handed over.'}</Lead>
      </Header>
      <FormShell>
        {editing && !address ? <Notice tone="info">Loading saved address...</Notice> : (
          <AddressEditorForm
            initialAddress={address}
            initialPhone={customer.phonePlaceholder}
            initialRecipientName={customer.displayName}
            onCancel={() => router.push('/customer/addresses')}
            onSaved={(addresses) => { if (customerId) syncAddresses(customerId, addresses); router.push('/customer/addresses'); }}
            submitLabel={editing ? 'Save changes' : 'Save address'}
          />
        )}
      </FormShell>
    </Page>
  );
}

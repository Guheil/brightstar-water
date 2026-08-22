'use client';

import { useRouter } from 'next/navigation';
import { CircleAlert, Plus } from 'lucide-react';
import { useState } from 'react';
import AddressCard from '@/components/customer/AddressCard';
import DialogMotionTransition from '@/components/ui/DialogMotionTransition';
import { Notice } from '@/components';
import { deleteCustomerAddress, setDefaultCustomerAddress } from '@/lib/addresses/client';
import { useAppStore } from '@/store';
import { dialogMotion } from '@/theme/transitions';
import type { DeliveryAddress } from '@/types';
import { getActiveCustomerId } from '../_shared/customer';
import { AddLink, BackLink, DeleteActions, DeleteButton, DeleteContent, DeleteDialog, DeleteTitle, Empty, EmptyCopy, EmptyTitle, Header, HeaderCopy, Lead, List, Page, Title } from './elements';

export default function AddressesScreen() {
  const router = useRouter();
  const customerId = useAppStore(getActiveCustomerId);
  const customer = useAppStore((state) => state.customers.records.find((item) => item.id === customerId));
  const initialized = useAppStore((state) => state.customers.addressesInitialized);
  const loadError = useAppStore((state) => state.customers.addressesError);
  const syncAddresses = useAppStore((state) => state.commands.syncCustomerAddresses);
  const [deleteAddress, setDeleteAddress] = useState<DeliveryAddress | null>(null);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');

  const applyAddresses = (addresses: DeliveryAddress[]) => {
    if (customerId) syncAddresses(customerId, addresses);
  };

  const setDefault = async (address: DeliveryAddress) => {
    setBusyId(address.id); setError('');
    try { applyAddresses((await setDefaultCustomerAddress(address.id)).addresses); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Default address could not be changed.'); }
    finally { setBusyId(''); }
  };

  const remove = async () => {
    if (!deleteAddress) return;
    setBusyId(deleteAddress.id); setError('');
    try { applyAddresses((await deleteCustomerAddress(deleteAddress.id)).addresses); setDeleteAddress(null); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'The address could not be deleted.'); }
    finally { setBusyId(''); }
  };

  return (
    <Page>
      <Header>
        <HeaderCopy>
          <BackLink href="/customer/account">Back to account</BackLink>
          <Title>Saved delivery addresses</Title>
          <Lead>Save the places you use most, pin the exact delivery point once, then choose an address during checkout.</Lead>
        </HeaderCopy>
        {customer && customer.addresses.length < 10 ? <AddLink href="/customer/addresses/new"><Plus size={18} /> Add address</AddLink> : null}
      </Header>

      {error ? <Notice tone="error" title="Address action failed">{error}</Notice> : null}
      {loadError ? <Notice tone="warning" title="Saved addresses may be incomplete">{loadError}</Notice> : null}

      <List>
        {!initialized ? <Notice tone="info">Loading saved delivery addresses...</Notice> : null}
        {initialized && customer?.addresses.length ? customer.addresses.map((address) => (
          <AddressCard
            address={address}
            busy={busyId === address.id}
            key={address.id}
            onDelete={setDeleteAddress}
            onEdit={(item) => router.push(`/customer/addresses/${item.id}/edit`)}
            onSetDefault={setDefault}
          />
        )) : null}
        {initialized && customer && customer.addresses.length === 0 ? (
          <Empty>
            <CircleAlert aria-hidden="true" size={30} />
            <EmptyTitle>No delivery address saved yet</EmptyTitle>
            <EmptyCopy>Add a Home, Work, or other delivery address so checkout can use a saved location instead of asking you to enter it again.</EmptyCopy>
            <AddLink href="/customer/addresses/new"><Plus size={18} /> Add your first address</AddLink>
          </Empty>
        ) : null}
      </List>

      <DeleteDialog
        aria-labelledby="delete-address-title"
        onClose={() => !busyId && setDeleteAddress(null)}
        open={Boolean(deleteAddress)}
        slots={{ transition: DialogMotionTransition }}
        transitionDuration={{ enter: dialogMotion.enterDuration, exit: dialogMotion.exitDuration }}
      >
        <DeleteTitle data-modal-title-text id="delete-address-title">Delete {deleteAddress?.label ?? 'address'}?</DeleteTitle>
        <DeleteContent data-modal-body>This removes the saved address from future checkouts. Existing order records keep their original delivery details.</DeleteContent>
        <DeleteActions data-modal-actions>
          <DeleteButton disabled={Boolean(busyId)} onClick={() => setDeleteAddress(null)}>Cancel</DeleteButton>
          <DeleteButton disabled={Boolean(busyId)} onClick={remove} variant="contained">{busyId ? 'Deleting...' : 'Delete address'}</DeleteButton>
        </DeleteActions>
      </DeleteDialog>
    </Page>
  );
}

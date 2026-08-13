'use client';

import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import Notice from '@/components/ui/Notice';
import StatusText from '@/components/ui/StatusText';
import {
  selectProductsWithAvailability,
  useAppStore,
} from '@/store';
import type { InventoryItem } from '@/types';
import { getAvailableStock, isLowStock } from '@/utils';
import AdminConfirmDialog from '../components/AdminConfirmDialog';
import AdminDataTable from '../components/AdminDataTable';
import type { AdminDataColumn } from '../components/AdminDataTable/interface';
import AdminPageHeader from '../components/AdminPageHeader';
import { ADMIN_ACTOR_ID, formatDateTime, humanize } from '../utils';
import {
  AdjustmentForm,
  AdjustmentSection,
  FormField,
  FormOption,
  HistoryItem,
  HistoryList,
  HistoryMeta,
  HistorySection,
  HistoryText,
  Root,
  SectionCopy,
  SectionTitle,
  SubmitButton,
} from './elements';
import type { AdminInventoryMode, InventoryScreenProps } from './interface';

type Feedback = { tone: 'success' | 'error'; title: string; message: string };

export default function InventoryScreen({ className }: InventoryScreenProps) {
  const products = useAppStore(useShallow(selectProductsWithAvailability));
  const inventory = useAppStore((state) => state.inventory.items);
  const adjustments = useAppStore((state) => state.inventory.adjustments);
  const adjustStock = useAppStore((state) => state.commands.adjustStock);
  const [productId, setProductId] = useState(products[0]?.id ?? '');
  const [mode, setMode] = useState<AdminInventoryMode>('increase');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const columns: readonly AdminDataColumn<InventoryItem>[] = [
    {
      key: 'product',
      label: 'Product',
      render: (item) =>
        products.find((product) => product.id === item.productId)?.name ?? item.productId,
    },
    {
      key: 'sku',
      label: 'SKU',
      render: (item) =>
        products.find((product) => product.id === item.productId)?.sku ?? 'Not available',
    },
    {
      key: 'category',
      label: 'Category',
      render: (item) =>
        humanize(
          products.find((product) => product.id === item.productId)?.category ?? 'unknown',
        ),
    },
    {
      key: 'on_hand',
      label: 'On hand',
      align: 'right',
      render: (item) => item.stockOnHand,
    },
    {
      key: 'reserved',
      label: 'Reserved',
      align: 'right',
      render: (item) => item.stockReserved,
    },
    {
      key: 'available',
      label: 'Available',
      align: 'right',
      render: (item) => getAvailableStock(item),
    },
    {
      key: 'reorder',
      label: 'Reorder level',
      align: 'right',
      render: (item) => item.reorderLevel,
    },
    {
      key: 'condition',
      label: 'Condition',
      render: (item) => (
        <StatusText tone={isLowStock(item) ? 'warning' : 'success'}>
          {isLowStock(item) ? 'Low stock' : 'Stock available'}
        </StatusText>
      ),
    },
    {
      key: 'updated',
      label: 'Last update',
      render: (item) => formatDateTime(item.updatedAt),
    },
  ];

  const openConfirmation = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setConfirmOpen(true);
  };

  const confirmAdjustment = () => {
    const numericQuantity = Number(quantity);
    const result = adjustStock({
      productId,
      mode,
      quantity: numericQuantity,
      reason,
      actorId: ADMIN_ACTOR_ID,
    });

    setFeedback(
      result.ok
        ? {
            tone: 'success',
            title: 'Inventory updated',
            message: 'Product availability and inventory history were updated.',
          }
        : { tone: 'error', title: 'Adjustment failed', message: result.error.message },
    );
    if (result.ok) {
      setQuantity('');
      setReason('');
    }
    setConfirmOpen(false);
  };

  return (
    <Root className={className}>
      <AdminPageHeader
        description="Maintain physical stock counts while preserving inventory reserved by active orders."
        title="Inventory"
      />

      {feedback ? (
        <Notice title={feedback.title} tone={feedback.tone}>
          {feedback.message}
        </Notice>
      ) : null}

      <AdjustmentSection>
        <SectionTitle>Record an adjustment</SectionTitle>
        <SectionCopy>A reason is required to keep the inventory history clear.</SectionCopy>
        <AdjustmentForm onSubmit={openConfirmation}>
          <FormField
            label="Product"
            onChange={(event) => setProductId(event.target.value)}
            required
            select
            value={productId}
          >
            {products.map((product) => (
              <FormOption key={product.id} value={product.id}>
                {product.name} ({product.availableStock} available)
              </FormOption>
            ))}
          </FormField>
          <FormField
            label="Adjustment"
            onChange={(event) => setMode(event.target.value as AdminInventoryMode)}
            select
            value={mode}
          >
            <FormOption value="increase">Increase stock</FormOption>
            <FormOption value="decrease">Decrease stock</FormOption>
            <FormOption value="set">Set physical count</FormOption>
          </FormField>
          <FormField
            label="Quantity"
            onChange={(event) => setQuantity(event.target.value)}
            required
            slotProps={{ htmlInput: { min: 0, step: 1 } }}
            type="number"
            value={quantity}
          />
          <FormField
            label="Reason"
            onChange={(event) => setReason(event.target.value)}
            required
            value={reason}
          />
          <SubmitButton type="submit">Review adjustment</SubmitButton>
        </AdjustmentForm>
      </AdjustmentSection>

      <section aria-labelledby="inventory-table-title">
        <SectionTitle id="inventory-table-title">Current stock</SectionTitle>
        <AdminDataTable
          ariaLabel="Current inventory"
          columns={columns}
          getRowKey={(item) => item.productId}
          rows={inventory}
        />
      </section>

      <HistorySection>
        <SectionTitle>Recent inventory history</SectionTitle>
        <HistoryList>
          {adjustments.slice(0, 8).map((adjustment) => {
            const product = products.find((item) => item.id === adjustment.productId);
            return (
              <HistoryItem key={adjustment.id}>
                <HistoryText>{product?.name ?? adjustment.productId}</HistoryText>
                <HistoryText>
                  {humanize(adjustment.mode)} {adjustment.quantity}
                </HistoryText>
                <HistoryMeta>{adjustment.reason}</HistoryMeta>
                <HistoryMeta>{formatDateTime(adjustment.createdAt)}</HistoryMeta>
              </HistoryItem>
            );
          })}
        </HistoryList>
      </HistorySection>

      <AdminConfirmDialog
        confirmLabel="Apply adjustment"
        description="This changes product availability and records an inventory history event. Reserved stock cannot be undercut."
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmAdjustment}
        open={confirmOpen}
        title="Apply this inventory adjustment?"
      />
    </Root>
  );
}

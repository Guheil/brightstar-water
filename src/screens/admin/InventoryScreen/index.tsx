'use client';

import { SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import Notice from '@/components/ui/Notice';
import StatusText from '@/components/ui/StatusText';
import { selectProductsWithAvailability, useAppStore } from '@/store';
import type { InventoryItem } from '@/types';
import { getAvailableStock, isLowStock } from '@/utils';
import AdminConfirmDialog from '../components/AdminConfirmDialog';
import AdminDataTable from '../components/AdminDataTable';
import type { AdminDataColumn } from '../components/AdminDataTable/interface';
import AdminEntityActionMenu from '../components/AdminEntityActionMenu';
import AdminFormDialog from '../components/AdminFormDialog';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminMetricStrip from '../components/AdminMetricStrip';
import { ADMIN_ACTOR_ID, formatDateTime, humanize } from '../utils';
import {
  AdjustButton,
  AdjustmentForm,
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
} from './elements';
import type { AdminInventoryMode, InventoryScreenProps } from './interface';

type Feedback = { tone: 'success' | 'error'; title: string; message: string };

export default function InventoryScreen({ className }: InventoryScreenProps) {
  const products = useAppStore(selectProductsWithAvailability);
  const inventory = useAppStore((state) => state.inventory.items);
  const adjustments = useAppStore((state) => state.inventory.adjustments);
  const adjustStock = useAppStore((state) => state.commands.adjustStock);
  const [productId, setProductId] = useState(products[0]?.id ?? '');
  const [mode, setMode] = useState<AdminInventoryMode>('increase');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [adjustmentOpen, setAdjustmentOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const inventoryMetrics = [
    { label: 'Products monitored', value: inventory.length },
    { label: 'Available units', value: inventory.reduce((sum, item) => sum + getAvailableStock(item), 0), tone: 'water' as const },
    { label: 'Reserved units', value: inventory.reduce((sum, item) => sum + item.stockReserved, 0), tone: 'gas' as const },
    { label: 'Low stock', value: inventory.filter(isLowStock).length, tone: 'warning' as const },
  ];

  const openAdjustment = (nextProductId?: string) => {
    if (nextProductId) setProductId(nextProductId);
    setMode('increase');
    setQuantity('');
    setReason('');
    setAdjustmentOpen(true);
  };

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
        humanize(products.find((product) => product.id === item.productId)?.category ?? 'unknown'),
    },
    { key: 'on_hand', label: 'On hand', align: 'right', render: (item) => item.stockOnHand },
    { key: 'reserved', label: 'Reserved', align: 'right', render: (item) => item.stockReserved },
    { key: 'available', label: 'Available', align: 'right', render: (item) => getAvailableStock(item) },
    { key: 'reorder', label: 'Reorder level', align: 'right', render: (item) => item.reorderLevel },
    {
      key: 'condition',
      label: 'Condition',
      render: (item) => (
        <StatusText tone={isLowStock(item) ? 'warning' : 'success'}>
          {isLowStock(item) ? 'Low stock' : 'Stock available'}
        </StatusText>
      ),
    },
    { key: 'updated', label: 'Last update', render: (item) => formatDateTime(item.updatedAt) },
    {
      key: 'actions',
      label: 'Actions',
      render: (item) => {
        const product = products.find((candidate) => candidate.id === item.productId);
        return (
          <AdminEntityActionMenu
            actions={[
              {
                label: 'Adjust stock',
                icon: SlidersHorizontal,
                onSelect: () => openAdjustment(item.productId),
              },
            ]}
            ariaLabel={`Inventory actions for ${product?.name ?? item.productId}`}
          />
        );
      },
    },
  ];

  const reviewAdjustment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const numericQuantity = Number(quantity);
    if (!productId || !Number.isInteger(numericQuantity) || numericQuantity < 0 || !reason.trim()) {
      setFeedback({
        tone: 'error',
        title: 'Adjustment not ready',
        message: 'Choose a product, enter a whole-number quantity, and provide a reason.',
      });
      return;
    }
    setAdjustmentOpen(false);
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
            message: 'Available stock and inventory history were updated together.',
          }
        : { tone: 'error', title: 'Adjustment failed', message: result.error.message },
    );
    setConfirmOpen(false);
  };

  return (
    <Root className={className}>
      <AdminPageHeader
        actions={<AdjustButton onClick={() => openAdjustment()}>Record adjustment</AdjustButton>}
        description="Monitor available and reserved stock, low-stock thresholds, and reasoned inventory adjustments."
        title="Inventory"
      />

      <AdminMetricStrip ariaLabel="Inventory summary" items={inventoryMetrics} />

      {feedback ? (
        <Notice title={feedback.title} tone={feedback.tone}>
          {feedback.message}
        </Notice>
      ) : null}

      <section aria-labelledby="inventory-table-title">
        <SectionTitle id="inventory-table-title">Current stock</SectionTitle>
        <SectionCopy>
          Available stock already subtracts quantities reserved by active customer orders.
        </SectionCopy>
        <AdminDataTable
          ariaLabel="Current inventory"
          columns={columns}
          getRowKey={(item) => item.productId}
          rows={inventory}
        />
      </section>

      <HistorySection>
        <SectionTitle>Recent inventory history</SectionTitle>
        <SectionCopy>Every stock correction keeps its reason and timestamp.</SectionCopy>
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

      <AdminFormDialog
        description="Record the physical stock change and a clear reason. Reserved inventory cannot be undercut by an adjustment."
        formId="inventory-adjustment-form"
        onClose={() => setAdjustmentOpen(false)}
        open={adjustmentOpen}
        submitLabel="Review adjustment"
        title="Record inventory adjustment"
      >
        <AdjustmentForm id="inventory-adjustment-form" onSubmit={reviewAdjustment}>
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
            multiline
            onChange={(event) => setReason(event.target.value)}
            required
            rows={3}
            value={reason}
          />
        </AdjustmentForm>
      </AdminFormDialog>

      <AdminConfirmDialog
        confirmLabel="Apply adjustment"
        confirmTone="primary"
        description="This changes product availability and creates an inventory-history event. The adjustment cannot reduce physical stock below reserved stock."
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmAdjustment}
        open={confirmOpen}
        title="Apply this inventory adjustment?"
      />
    </Root>
  );
}

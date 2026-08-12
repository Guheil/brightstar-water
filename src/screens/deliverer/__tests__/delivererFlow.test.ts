import { beforeEach, describe, expect, it } from 'vitest';
import { useAppStore } from '@/store';

const DELIVERER_ID = 'deliverer-demo-01';
const AT = '2026-08-12T05:00:00.000Z';

describe('deliverer workflow boundaries', () => {
  beforeEach(() => useAppStore.getState().commands.resetDemoState());

  it('rejects another deliverer accepting an assignment', () => {
    const result = useAppStore
      .getState()
      .commands.acceptDelivery('delivery-0002', 'deliverer-demo-02', AT);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('not_allowed');
  });

  it('records a failed attempt without silently changing stock or refunds', () => {
    useAppStore.setState((state) => ({
      deliveries: {
        ...state.deliveries,
        records: state.deliveries.records.map((delivery) =>
          delivery.id === 'delivery-0002'
            ? {
                ...delivery,
                delivererId: DELIVERER_ID,
                status: 'out_for_delivery' as const,
              }
            : delivery,
        ),
      },
      orders: {
        records: state.orders.records.map((order) =>
          order.id === 'order-0002'
            ? { ...order, status: 'out_for_delivery' as const }
            : order,
        ),
      },
    }));
    const beforeInventory = structuredClone(useAppStore.getState().inventory.items);
    const result = useAppStore
      .getState()
      .commands.failDelivery(
        'delivery-0002',
        DELIVERER_ID,
        'customer_unavailable',
        'Demo recipient unavailable.',
        AT,
      );

    expect(result.ok).toBe(true);
    const state = useAppStore.getState();
    expect(state.orders.records.find((order) => order.id === 'order-0002')?.status).toBe(
      'delivery_failed',
    );
    expect(state.inventory.items).toEqual(beforeInventory);
    expect(state.orders.records.find((order) => order.id === 'order-0002')?.refund).toBeUndefined();
  });
});

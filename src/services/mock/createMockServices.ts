import { DEMO_AUTH_ACCOUNTS } from '@/mocks';
import type {
  AppServices,
  DeliveryQuery,
  OrderQuery,
  ProductQuery,
} from '@/services/interfaces';
import type {
  AuthSession,
  Customer,
  Delivery,
  EntityId,
  InventoryItem,
  LoyaltyAccount,
  Order,
  PaymentRecord,
  Product,
} from '@/types';
import { commandFailure, commandSuccess } from '@/utils';
import { cloneDemoData, MockRepository } from './repository';

export interface MockServiceOptions {
  delayMs?: number;
  clock?: () => string;
}

const upsertById = <T extends { id: EntityId }>(items: T[], next: T): T => {
  const index = items.findIndex((item) => item.id === next.id);

  if (index === -1) {
    items.push(cloneDemoData(next));
  } else {
    items[index] = cloneDemoData(next);
  }

  return cloneDemoData(next);
};

const upsertByKey = <T, K>(
  items: T[],
  keyOf: (item: T) => K,
  next: T,
): T => {
  const index = items.findIndex((item) => keyOf(item) === keyOf(next));

  if (index === -1) {
    items.push(cloneDemoData(next));
  } else {
    items[index] = cloneDemoData(next);
  }

  return cloneDemoData(next);
};

export const createMockServices = (
  options: MockServiceOptions = {},
): AppServices => {
  const repository = new MockRepository();
  const delayMs = Math.max(0, options.delayMs ?? 180);
  const clock = options.clock ?? (() => new Date().toISOString());
  let session: AuthSession | null = null;

  const respond = async <T>(produce: () => T): Promise<T> => {
    if (delayMs > 0) {
      await new Promise<void>((resolve) => {
        globalThis.setTimeout(resolve, delayMs);
      });
    }

    return cloneDemoData(produce());
  };

  const matchesProductQuery = (product: Product, query?: ProductQuery): boolean => {
    if (query?.category && product.category !== query.category) return false;
    if (query?.activeOnly && !product.isActive) return false;
    if (!query?.search?.trim()) return true;
    const search = query.search.trim().toLocaleLowerCase();
    return [product.name, product.sku, product.shortDescription].some((value) =>
      value.toLocaleLowerCase().includes(search),
    );
  };

  const matchesOrderQuery = (order: Order, query?: OrderQuery): boolean => {
    if (query?.customerId && order.customerId !== query.customerId) return false;
    if (query?.statuses?.length && !query.statuses.includes(order.status)) return false;
    if (!query?.search?.trim()) return true;
    const search = query.search.trim().toLocaleLowerCase();
    return (
      order.reference.toLocaleLowerCase().includes(search) ||
      order.items.some((item) => item.name.toLocaleLowerCase().includes(search))
    );
  };

  const matchesDeliveryQuery = (
    delivery: Delivery,
    query?: DeliveryQuery,
  ): boolean => {
    if (query?.delivererId && delivery.delivererId !== query.delivererId) return false;
    if (query?.statuses?.length && !query.statuses.includes(delivery.status)) return false;
    return true;
  };

  return {
    auth: {
      getSession: () => respond(() => session),
      signIn: (credentials, at = clock()) =>
        respond(() => {
          const normalizedEmail = credentials.email.trim().toLocaleLowerCase();
          const account = DEMO_AUTH_ACCOUNTS.find(
            (candidate) => candidate.email.toLocaleLowerCase() === normalizedEmail,
          );

          if (!account || account.password !== credentials.password) {
            return commandFailure('invalid_input', 'Use one of the documented demo accounts.');
          }

          const user = {
            id: account.id,
            role: account.role,
            displayName: account.displayName,
            email: account.email,
            ...(account.customerId ? { customerId: account.customerId } : {}),
            ...(account.delivererId ? { delivererId: account.delivererId } : {}),
          };
          const nextSession: AuthSession = { user, signedInAt: at };
          session = nextSession;
          return commandSuccess(nextSession);
        }),
      signOut: async () => {
        await respond(() => undefined);
        session = null;
      },
    },
    products: {
      list: (query) =>
        respond(() => repository.read().products.filter((item) => matchesProductQuery(item, query))),
      getById: (productId) =>
        respond(() => repository.read().products.find((item) => item.id === productId) ?? null),
      save: (product) =>
        respond(() => upsertById(repository.read().products, product)),
      setActive: (productId, isActive, at) =>
        respond(() => {
          const product = repository.read().products.find((item) => item.id === productId);
          if (!product) return null;
          product.isActive = isActive;
          product.updatedAt = at;
          return product;
        }),
    },
    customers: {
      list: () => respond(() => repository.read().customers),
      getById: (customerId) =>
        respond(() => repository.read().customers.find((item) => item.id === customerId) ?? null),
      save: (customer: Customer) =>
        respond(() => upsertById(repository.read().customers, customer)),
    },
    orders: {
      list: (query) =>
        respond(() => repository.read().orders.filter((item) => matchesOrderQuery(item, query))),
      getById: (orderId) =>
        respond(() => repository.read().orders.find((item) => item.id === orderId) ?? null),
      save: (order: Order) =>
        respond(() => upsertById(repository.read().orders, order)),
    },
    inventory: {
      list: () => respond(() => repository.read().inventory),
      getByProductId: (productId) =>
        respond(
          () => repository.read().inventory.find((item) => item.productId === productId) ?? null,
        ),
      save: (item: InventoryItem) =>
        respond(() =>
          upsertByKey(repository.read().inventory, (candidate) => candidate.productId, item),
        ),
      listAdjustments: (productId) =>
        respond(() =>
          repository
            .read()
            .inventoryAdjustments.filter((item) => !productId || item.productId === productId),
        ),
      appendAdjustment: (adjustment) =>
        respond(() => {
          repository.read().inventoryAdjustments.unshift(cloneDemoData(adjustment));
          return adjustment;
        }),
    },
    deliveries: {
      list: (query) =>
        respond(() =>
          repository.read().deliveries.filter((item) => matchesDeliveryQuery(item, query)),
        ),
      getById: (deliveryId) =>
        respond(() => repository.read().deliveries.find((item) => item.id === deliveryId) ?? null),
      save: (delivery: Delivery) =>
        respond(() => upsertById(repository.read().deliveries, delivery)),
      listDeliverers: () => respond(() => repository.read().deliverers),
    },
    loyalty: {
      listAccounts: () => respond(() => repository.read().loyaltyAccounts),
      getAccount: (customerId) =>
        respond(
          () =>
            repository.read().loyaltyAccounts.find((item) => item.customerId === customerId) ??
            null,
        ),
      saveAccount: (account: LoyaltyAccount) =>
        respond(() =>
          upsertByKey(
            repository.read().loyaltyAccounts,
            (candidate) => candidate.customerId,
            account,
          ),
        ),
      listActivity: (customerId) =>
        respond(() =>
          repository
            .read()
            .loyaltyActivity.filter((item) => !customerId || item.customerId === customerId),
        ),
      appendActivity: (activity) =>
        respond(() => {
          repository.read().loyaltyActivity.unshift(cloneDemoData(activity));
          return activity;
        }),
    },
    payments: {
      list: () => respond(() => repository.read().payments),
      getForOrder: (orderId) =>
        respond(() => repository.read().payments.find((item) => item.orderId === orderId) ?? null),
      save: (payment: PaymentRecord) =>
        respond(() => upsertById(repository.read().payments, payment)),
    },
    dataService: {
      loadSnapshot: () => respond(() => repository.snapshot()),
      reset: () => respond(() => repository.reset()),
    },
  };
};

export const createImmediateMockServices = (
  snapshotClock?: () => string,
): AppServices => createMockServices({ delayMs: 0, clock: snapshotClock });

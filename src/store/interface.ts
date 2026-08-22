import type {
  AuthSession,
  CartLine,
  CommandResult,
  Customer,
  DeliveryAddress,
  DelivererProfile,
  Delivery,
  DeliveryFailureReason,
  EntityId,
  InventoryAdjustment,
  InventoryAdjustmentMode,
  InventoryItem,
  ISODateString,
  LoyaltyAccount,
  LoyaltyActivity,
  Order,
  PaymentRecord,
  Product,
  RefundStatus,
  PlaceOrderInput,
} from '@/types';

export interface AuthSliceState {
  session: AuthSession | null;
  accessNotice: string;
  initialized: boolean;
}

export interface SyncAuthSessionInput {
  session: AuthSession | null;
  phone?: string;
}

export interface SyncCatalogSnapshotInput {
  products: Product[];
  inventory: InventoryItem[];
}

export interface SyncOperationalSnapshotInput {
  orders: Order[];
  deliveries: Delivery[];
  payments: PaymentRecord[];
  deliverers: DelivererProfile[];
  customers: Customer[];
  loyaltyAccounts: LoyaltyAccount[];
  loyaltyActivity: LoyaltyActivity[];
}

export interface CatalogSliceState {
  products: Product[];
  initialized: boolean;
  error: string | null;
}

export interface CartSliceState {
  items: CartLine[];
  lastPlacedOrderId: EntityId | null;
  ownerCustomerId: EntityId | null;
  initialized: boolean;
  error: string | null;
}

export interface CustomerSliceState {
  records: Customer[];
  addressesInitialized: boolean;
  addressesError: string | null;
}

export interface OrderSliceState {
  records: Order[];
}

export interface InventorySliceState {
  items: InventoryItem[];
  adjustments: InventoryAdjustment[];
}

export interface DeliverySliceState {
  records: Delivery[];
  deliverers: DelivererProfile[];
}

export interface LoyaltySliceState {
  accounts: LoyaltyAccount[];
  activity: LoyaltyActivity[];
}

export interface PaymentSliceState {
  records: PaymentRecord[];
}

export interface AppMetaState {
  nextOrderSequence: number;
  nextOrderEventSequence: number;
  nextInventoryEventSequence: number;
  nextLoyaltyEventSequence: number;
  nextCancellationSequence: number;
  nextRefundSequence: number;
  nextCustomerSequence: number;
  nextUserSequence: number;
  nextAddressSequence: number;
}

export interface StockAdjustmentInput {
  productId: EntityId;
  mode: Extract<InventoryAdjustmentMode, 'increase' | 'decrease' | 'set'>;
  quantity: number;
  reason: string;
  actorId: EntityId;
  at?: ISODateString;
}


export interface SaveDeliveryAddressInput {
  customerId: EntityId;
  label: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  area: string;
  municipality: string;
  province: string;
  distanceKm: number;
  latitude: number;
  longitude: number;
  deliveryNote?: string;
  makeDefault?: boolean;
  at?: ISODateString;
}


export interface DeliveryCompletionInput {
  deliveryId: EntityId;
  delivererId: EntityId;
  cashReceivedCentavos?: number;
  proofImageDataUrl?: string;
  proofFileName?: string;
  note?: string;
  at?: ISODateString;
}

export interface LoyaltyAdjustmentInput {
  customerId: EntityId;
  pointsDelta: number;
  reason: string;
  actorId: EntityId;
  at?: ISODateString;
}

export interface AppCommands {
  syncAuthSession(input: SyncAuthSessionInput): void;
  syncCatalogSnapshot(input: SyncCatalogSnapshotInput): void;
  syncOperationalSnapshot(input: SyncOperationalSnapshotInput): void;
  mergeOperationalSnapshot(input: SyncOperationalSnapshotInput): void;
  syncCustomerAddresses(customerId: EntityId, addresses: DeliveryAddress[]): void;
  syncCustomerCart(customerId: EntityId, items: CartLine[]): void;
  markCustomerCartFailed(customerId: EntityId, message: string): void;
  markCustomerAddressesFailed(message: string): void;
  markCatalogLoadFailed(message: string): void;
  signOut(): void;
  saveDeliveryAddress(input: SaveDeliveryAddressInput): CommandResult<DeliveryAddress>;
  addCartItem(productId: EntityId, quantity?: number): CommandResult<CartLine>;
  updateCartItemQuantity(productId: EntityId, quantity: number): CommandResult<CartLine>;
  removeCartItem(productId: EntityId): void;
  clearCart(): void;
  setLastPlacedOrderId(orderId: EntityId | null): void;
  placeOrder(input: PlaceOrderInput): CommandResult<Order>;
  confirmOrder(orderId: EntityId, actorId: EntityId, at?: ISODateString): CommandResult<Order>;
  markOrderPreparing(
    orderId: EntityId,
    actorId: EntityId,
    at?: ISODateString,
  ): CommandResult<Order>;
  assignDelivery(
    orderId: EntityId,
    delivererId: EntityId,
    actorId: EntityId,
    at?: ISODateString,
  ): CommandResult<Delivery>;
  acceptDelivery(
    deliveryId: EntityId,
    delivererId: EntityId,
    at?: ISODateString,
  ): CommandResult<Delivery>;
  startDelivery(
    deliveryId: EntityId,
    delivererId: EntityId,
    at?: ISODateString,
  ): CommandResult<Delivery>;
  recordDeliveryCompletion(input: DeliveryCompletionInput): CommandResult<Delivery>;
  completeDelivery(
    deliveryId: EntityId,
    delivererId: EntityId,
    at?: ISODateString,
  ): CommandResult<Delivery>;
  failDelivery(
    deliveryId: EntityId,
    delivererId: EntityId,
    reason: DeliveryFailureReason,
    note?: string,
    at?: ISODateString,
  ): CommandResult<Delivery>;
  requestCancellation(
    orderId: EntityId,
    customerId: EntityId,
    reason: string,
    at?: ISODateString,
  ): CommandResult<Order>;
  resolveCancellation(
    orderId: EntityId,
    actorId: EntityId,
    decision: 'approve' | 'reject',
    note?: string,
    at?: ISODateString,
  ): CommandResult<Order>;
  verifyPayment(
    orderId: EntityId,
    actorId: EntityId,
    reference?: string,
    at?: ISODateString,
  ): CommandResult<PaymentRecord>;
  updateRefund(
    orderId: EntityId,
    actorId: EntityId,
    targetStatus: RefundStatus,
    note?: string,
    at?: ISODateString,
  ): CommandResult<Order>;
  adjustStock(input: StockAdjustmentInput): CommandResult<InventoryItem>;
  adjustLoyalty(input: LoyaltyAdjustmentInput): CommandResult<LoyaltyAccount>;
  resetAppState(): void;
}

export interface AppStore {
  auth: AuthSliceState;
  catalog: CatalogSliceState;
  cart: CartSliceState;
  customers: CustomerSliceState;
  orders: OrderSliceState;
  inventory: InventorySliceState;
  deliveries: DeliverySliceState;
  loyalty: LoyaltySliceState;
  payments: PaymentSliceState;
  meta: AppMetaState;
  commands: AppCommands;
}

export type AppDataState = Omit<AppStore, 'commands'>;

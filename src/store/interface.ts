import type {
  AuthCredentials,
  AuthSession,
  CartLine,
  CommandResult,
  Customer,
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
  prototypeNotice: string;
}

export interface CatalogSliceState {
  products: Product[];
}

export interface CartSliceState {
  items: CartLine[];
  lastPlacedOrderId: EntityId | null;
}

export interface CustomerSliceState {
  records: Customer[];
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

export interface DemoMetaState {
  nextOrderSequence: number;
  nextOrderEventSequence: number;
  nextInventoryEventSequence: number;
  nextLoyaltyEventSequence: number;
  nextCancellationSequence: number;
  nextRefundSequence: number;
}

export interface StockAdjustmentInput {
  productId: EntityId;
  mode: Extract<InventoryAdjustmentMode, 'increase' | 'decrease' | 'set'>;
  quantity: number;
  reason: string;
  actorId: EntityId;
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
  signIn(credentials: AuthCredentials, at?: ISODateString): CommandResult<AuthSession>;
  signOut(): void;
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
    demoReference?: string,
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
  resetDemoState(): void;
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
  meta: DemoMetaState;
  commands: AppCommands;
}

export type AppDataState = Omit<AppStore, 'commands'>;

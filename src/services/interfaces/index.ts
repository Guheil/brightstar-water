import type {
  Customer,
  DelivererProfile,
  Delivery,
  DeliveryStatus,
  EntityId,
  InventoryAdjustment,
  InventoryItem,
  ISODateString,
  LoyaltyAccount,
  LoyaltyActivity,
  Order,
  OrderStatus,
  PaymentRecord,
  Product,
  ProductCategory,
} from '@/types';

export interface ProductQuery {
  category?: ProductCategory;
  activeOnly?: boolean;
  search?: string;
}

export interface OrderQuery {
  customerId?: EntityId;
  statuses?: readonly OrderStatus[];
  search?: string;
}

export interface DeliveryQuery {
  delivererId?: EntityId;
  statuses?: readonly DeliveryStatus[];
}

/** Catalog reads and Admin product mutations expected from a future product API. */
export interface ProductService {
  list(query?: ProductQuery): Promise<Product[]>;
  getById(productId: EntityId): Promise<Product | null>;
  save(product: Product): Promise<Product>;
  setActive(productId: EntityId, isActive: boolean, at: ISODateString): Promise<Product | null>;
}

/** Customer directory contract with role-aware access expectations. */
export interface CustomerService {
  list(): Promise<Customer[]>;
  getById(customerId: EntityId): Promise<Customer | null>;
  save(customer: Customer): Promise<Customer>;
}

/** Order persistence contract; workflow policy stays in domain commands, not components. */
export interface OrderService {
  list(query?: OrderQuery): Promise<Order[]>;
  getById(orderId: EntityId): Promise<Order | null>;
  save(order: Order): Promise<Order>;
}

/** Physical stock and its auditable adjustment history. */
export interface InventoryService {
  list(): Promise<InventoryItem[]>;
  getByProductId(productId: EntityId): Promise<InventoryItem | null>;
  save(item: InventoryItem): Promise<InventoryItem>;
  listAdjustments(productId?: EntityId): Promise<InventoryAdjustment[]>;
  appendAdjustment(adjustment: InventoryAdjustment): Promise<InventoryAdjustment>;
}

/** Assignment and delivery-status persistence expected by Admin and Deliverer clients. */
export interface DeliveryService {
  list(query?: DeliveryQuery): Promise<Delivery[]>;
  getById(deliveryId: EntityId): Promise<Delivery | null>;
  save(delivery: Delivery): Promise<Delivery>;
  listDeliverers(): Promise<DelivererProfile[]>;
}

/** Loyalty balances plus an append-only activity record. */
export interface LoyaltyService {
  listAccounts(): Promise<LoyaltyAccount[]>;
  getAccount(customerId: EntityId): Promise<LoyaltyAccount | null>;
  saveAccount(account: LoyaltyAccount): Promise<LoyaltyAccount>;
  listActivity(customerId?: EntityId): Promise<LoyaltyActivity[]>;
  appendActivity(activity: LoyaltyActivity): Promise<LoyaltyActivity>;
}

/** Payment state and verification contract used by the ordering workflow. */
export interface PaymentService {
  list(): Promise<PaymentRecord[]>;
  getForOrder(orderId: EntityId): Promise<PaymentRecord | null>;
  save(payment: PaymentRecord): Promise<PaymentRecord>;
}

export interface DataSnapshot {
  products: Product[];
  customers: Customer[];
  deliverers: DelivererProfile[];
  orders: Order[];
  deliveries: Delivery[];
  inventory: InventoryItem[];
  inventoryAdjustments: InventoryAdjustment[];
  loyaltyAccounts: LoyaltyAccount[];
  loyaltyActivity: LoyaltyActivity[];
  payments: PaymentRecord[];
}

/** Single hydration and reset boundary for application data. */
export interface DataService {
  loadSnapshot(): Promise<DataSnapshot>;
  reset(): Promise<DataSnapshot>;
}

export interface AppServices {
  products: ProductService;
  customers: CustomerService;
  orders: OrderService;
  inventory: InventoryService;
  deliveries: DeliveryService;
  loyalty: LoyaltyService;
  payments: PaymentService;
  dataService: DataService;
}


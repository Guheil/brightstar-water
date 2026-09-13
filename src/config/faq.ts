import type {
  FaqCategory,
  FaqContext,
  FaqContextTag,
  FaqItem,
} from '@/types/faq';

export const FAQ_CATEGORIES: readonly FaqCategory[] = [
  { id: 'ordering', label: 'Ordering' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'payments', label: 'Payments' },
  { id: 'orders', label: 'Orders' },
  { id: 'account', label: 'Account' },
  { id: 'products', label: 'Products' },
];

const gcashAnswer = 'When GCash is available, checkout shows the current recipient name, number or QR code, exact amount to send, and the payment-proof step before you submit the order.';

export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    id: 'place-order',
    question: 'How do I place an order?',
    answer:
      'Sign in or create a customer account, choose MRJE Gas or Bright Star Water, add available items to your cart, then continue to checkout. You will confirm your delivery address, schedule, payment method, and order details before submitting.',
    category: 'ordering',
    keywords: ['buy', 'checkout', 'cart', 'start order', 'place order'],
    contextTags: ['home', 'shop', 'product', 'cart', 'checkout'],
  },
  {
    id: 'account-required',
    question: 'Do I need an account to order?',
    answer:
      'You can browse products without signing in, but you need a customer account before adding items to an active order and completing checkout.',
    category: 'ordering',
    keywords: ['guest', 'sign in', 'register', 'account'],
    contextTags: ['home', 'shop', 'product', 'cart', 'account'],
  },
  {
    id: 'shared-cart',
    question: 'Can I order gas and water in the same cart?',
    answer:
      'Yes. MRJE Gas and Bright Star Water share one customer cart and checkout. Product availability is checked again before the order is submitted.',
    category: 'ordering',
    keywords: ['same order', 'gas and water', 'combined cart', 'both stores'],
    contextTags: ['shop', 'product', 'cart', 'checkout', 'mrje', 'brightstar'],
  },
  {
    id: 'delivery-fees',
    question: 'How are delivery fees calculated?',
    answer:
      'Delivery is free up to 3 km. Addresses over 3 km up to 6 km have a ₱30 fee, and addresses over 6 km up to 10 km have a ₱50 fee. Addresses beyond the 10 km service radius cannot continue through checkout.',
    category: 'delivery',
    keywords: ['fee', 'distance', 'kilometer', 'km', 'coverage', 'service area'],
    contextTags: ['delivery', 'addresses', 'checkout'],
  },
  {
    id: 'schedule-delivery',
    question: 'Can I schedule my delivery?',
    answer:
      'Yes. Checkout shows the earliest available estimate first. You can keep that schedule or choose a preferred delivery date within the available range, with morning, afternoon, or any available time when offered.',
    category: 'delivery',
    keywords: ['schedule', 'date', 'time', 'morning', 'afternoon', 'preferred'],
    contextTags: ['checkout', 'delivery'],
  },
  {
    id: 'delivery-address',
    question: 'How do I choose or change my delivery address?',
    answer:
      'Use your saved delivery addresses during checkout. You can add and manage Home, Work, or other pinned locations from Saved delivery addresses before placing the order.',
    category: 'delivery',
    keywords: ['address', 'pin', 'map', 'home', 'work', 'location'],
    contextTags: ['addresses', 'checkout', 'account', 'delivery'],
  },
  {
    id: 'payment-methods',
    question: 'What payment methods are available?',
    answer: 'Checkout always supports cash on delivery. GCash also appears when the administrator has configured an active payment destination.',
    category: 'payments',
    keywords: ['cod', 'cash', 'gcash', 'payment method', 'pay'],
    contextTags: ['checkout', 'payments', 'orders'],
  },
  {
    id: 'gcash',
    question: 'How does GCash payment work?',
    answer: gcashAnswer,
    category: 'payments',
    keywords: ['gcash', 'proof', 'screenshot', 'payment'],
    contextTags: ['checkout', 'payments', 'orders'],
  },
  {
    id: 'payment-proof',
    question: 'When do I upload payment proof?',
    answer: 'Payment proof is only needed when GCash is available and selected. Checkout shows the current recipient details first, then asks for a payment screenshot before the order is submitted.',
    category: 'payments',
    keywords: ['upload', 'screenshot', 'receipt', 'proof'],
    contextTags: ['checkout', 'payments'],
  },
  {
    id: 'order-status',
    question: 'What do the order statuses mean?',
    answer:
      'Pending review means the order was submitted for review. Confirmed means it was accepted. Preparing means the items are being prepared. Assigned for delivery means a deliverer has been assigned. Out for delivery means the delivery has started. Delivered means the order is complete. Cancelled means the order was cancelled. Delivery failed means the delivery could not be completed and needs follow-up.',
    category: 'orders',
    keywords: ['pending', 'confirmed', 'preparing', 'assigned', 'out for delivery', 'delivered', 'status'],
    contextTags: ['orders'],
  },
  {
    id: 'cancel-order',
    question: 'Can I cancel an order?',
    answer:
      'You can request cancellation while the order is pending review, confirmed, preparing, or assigned for delivery. Cancellation requests require Admin review and are no longer accepted once delivery has started.',
    category: 'orders',
    keywords: ['cancel', 'cancellation', 'stop order'],
    contextTags: ['orders'],
  },
  {
    id: 'track-order',
    question: 'Where can I follow my order?',
    answer:
      'Open My orders to review active and past orders. Each order shows its current status, delivery schedule, payment information, items, and delivery progress when available.',
    category: 'orders',
    keywords: ['track', 'history', 'delivery progress', 'my orders'],
    contextTags: ['orders', 'delivery'],
  },
  {
    id: 'profile-update',
    question: 'What can I update in my profile?',
    answer:
      'You can update your display name and contact number from Profile details. Your login email is shown as read-only because it is part of your sign-in credentials.',
    category: 'account',
    keywords: ['profile', 'name', 'phone', 'contact number', 'email'],
    contextTags: ['account'],
  },
  {
    id: 'loyalty-points',
    question: 'How do loyalty points work?',
    answer:
      'Eligible points are awarded after an order is delivered. Available points can be used during checkout at ₱1 per point, up to the merchandise subtotal. Delivery fees are not reduced by loyalty points.',
    category: 'account',
    keywords: ['loyalty', 'points', 'rewards', 'earn', 'redeem', 'discount'],
    contextTags: ['loyalty', 'orders', 'account'],
  },
  {
    id: 'mrje-availability',
    question: 'How do I check MRJE Gas product availability?',
    answer:
      'MRJE Gas product pages show current availability before checkout. Availability is checked again when you submit the order so the final quantity cannot exceed available stock.',
    category: 'products',
    keywords: ['lpg', 'gas', 'stock', 'available', 'availability'],
    contextTags: ['shop', 'product', 'mrje'],
    brands: ['mrje'],
  },
  {
    id: 'brightstar-availability',
    question: 'Can I change the quantity of Bright Star Water items?',
    answer:
      'Yes. You can adjust item quantities in the cart before checkout. Bright Star Water availability is checked again before the order is submitted.',
    category: 'products',
    keywords: ['water', 'quantity', 'refill', 'stock', 'cart'],
    contextTags: ['shop', 'product', 'cart', 'brightstar'],
    brands: ['brightstar'],
  },
];

function getContextTags(pathname: string): readonly FaqContextTag[] {
  if (pathname.startsWith('/customer/checkout')) return ['checkout', 'delivery', 'payments'];
  if (pathname.startsWith('/customer/cart')) return ['cart'];
  if (pathname.startsWith('/customer/orders')) return ['orders', 'delivery'];
  if (pathname.startsWith('/customer/addresses')) return ['addresses', 'delivery', 'account'];
  if (pathname.startsWith('/customer/loyalty')) return ['loyalty', 'account'];
  if (pathname.startsWith('/customer/profile') || pathname.startsWith('/customer/account')) return ['account'];
  if (pathname.includes('/product/')) return ['product', pathname.startsWith('/mrje') ? 'mrje' : pathname.startsWith('/brightstar') ? 'brightstar' : 'shop'];
  if (pathname.endsWith('/shop') || pathname === '/shop') return ['shop', pathname.startsWith('/mrje') ? 'mrje' : pathname.startsWith('/brightstar') ? 'brightstar' : 'home'];
  if (pathname.includes('/delivery') || pathname === '/about-delivery') return ['delivery'];
  if (pathname === '/mrje') return ['home', 'mrje'];
  if (pathname === '/brightstar') return ['home', 'brightstar'];
  return ['home'];
}

function itemSearchText(item: FaqItem): string {
  return [item.question, item.answer, ...item.keywords].join(' ').toLocaleLowerCase();
}

export function getFaqItemsForContext({ pathname, brandKey }: FaqContext): readonly FaqItem[] {
  const tags = new Set(getContextTags(pathname));

  return FAQ_ITEMS
    .filter((item) => !item.brands || !brandKey || item.brands.includes(brandKey))
    .map((item, index) => ({
      item,
      index,
      score: item.contextTags.reduce((total, tag) => total + (tags.has(tag) ? 1 : 0), 0),
    }))
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map(({ item }) => item);
}

export function searchFaqItems(items: readonly FaqItem[], query: string): readonly FaqItem[] {
  const terms = query
    .trim()
    .toLocaleLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  if (!terms.length) return items;

  return items.filter((item) => {
    const haystack = itemSearchText(item);
    return terms.every((term) => haystack.includes(term));
  });
}

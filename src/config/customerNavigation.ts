import type {
  CustomerMegaMenuGroup,
  CustomerNavigationItem,
} from '@/components/layout/CustomerHeader/interface';

export const customerPrimaryNavigation: readonly CustomerNavigationItem[] = [
  { label: 'Delivery', href: '/about-delivery' },
  { label: 'My orders', href: '/customer/orders' },
];

export const customerMegaMenuGroups: readonly CustomerMegaMenuGroup[] = [
  {
    title: 'Products',
    links: [
      {
        label: 'Shop all',
        description: 'Browse every available household essential.',
        href: '/shop',
      },
      {
        label: 'LPG',
        description: 'Household cylinders and practical accessories.',
        href: '/shop?category=gas',
        tone: 'gas',
      },
      {
        label: 'Purified water',
        description: 'Refills, containers, and bottled water.',
        href: '/shop?category=water',
        tone: 'water',
      },
    ],
  },
  {
    title: 'Customer service',
    links: [
      {
        label: 'Delivery area',
        description: 'Review the 3 km, 6 km, and 10 km fee zones.',
        href: '/about-delivery',
      },
      {
        label: 'Loyalty points',
        description: 'See your available points and recent activity.',
        href: '/customer/loyalty',
      },
      {
        label: 'Account overview',
        description: 'Manage profile and delivery information.',
        href: '/customer/account',
      },
    ],
  },
  {
    title: 'Your order',
    links: [
      {
        label: 'Cart',
        description: 'Review products before checkout.',
        href: '/customer/cart',
      },
      {
        label: 'Order history',
        description: 'Follow active deliveries and past orders.',
        href: '/customer/orders',
      },
      {
        label: 'Checkout',
        description: 'Confirm delivery, payment, and order details.',
        href: '/customer/checkout',
      },
    ],
  },
];

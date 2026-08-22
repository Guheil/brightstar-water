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
        label: 'Choose a storefront',
        description: 'Choose MRJE Gas or Bright Star Water before browsing.',
        href: '/',
      },
      {
        label: 'LPG',
        description: 'Household cylinders and practical accessories.',
        href: '/mrje/shop',
        tone: 'gas',
      },
      {
        label: 'Purified water',
        description: 'Refills, containers, and bottled water.',
        href: '/brightstar/shop',
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
        label: 'Saved delivery addresses',
        description: 'Manage Home, Work, and other pinned locations.',
        href: '/customer/addresses',
      },
      {
        label: 'Account overview',
        description: 'Manage your customer account and profile.',
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

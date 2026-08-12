'use client';

import { usePathname } from 'next/navigation';
import { CustomerFooter, CustomerHeader } from '@/components';
import {
  customerMegaMenuGroups,
  customerPrimaryNavigation,
} from '@/config';
import { selectCartItemCount, useAppStore } from '@/store';
import {
  Main,
  PrototypeBanner,
  PrototypeBannerInner,
  ShellRoot,
} from './elements';
import type { CustomerAreaShellProps, CustomerCartContextValue } from './interface';

const FOOTER_GROUPS = [
  {
    title: 'Order',
    links: [
      { href: '/shop', label: 'Browse products' },
      { href: '/customer/cart', label: 'Cart' },
      { href: '/customer/orders', label: 'Track orders' },
    ],
  },
  {
    title: 'Account',
    links: [
      { href: '/customer/account', label: 'Account overview' },
      { href: '/customer/profile', label: 'Profile and addresses' },
      { href: '/customer/loyalty', label: 'Loyalty points' },
    ],
  },
] as const;

export function useCustomerCart(): CustomerCartContextValue {
  const items = useAppStore((state) => state.cart.items);
  const itemCount = useAppStore(selectCartItemCount);
  const lastPlacedOrderId = useAppStore((state) => state.cart.lastPlacedOrderId);
  const commands = useAppStore((state) => state.commands);

  return {
    items,
    itemCount,
    lastPlacedOrderId,
    addItem: (productId, quantity) => {
      commands.addCartItem(productId, quantity);
    },
    updateQuantity: (productId, quantity) => {
      if (quantity < 1) commands.removeCartItem(productId);
      else commands.updateCartItemQuantity(productId, quantity);
    },
    removeItem: commands.removeCartItem,
    clearCart: commands.clearCart,
    setLastPlacedOrderId: commands.setLastPlacedOrderId,
  };
}

export default function CustomerAreaShell({ children }: CustomerAreaShellProps) {
  const pathname = usePathname();
  const itemCount = useAppStore(selectCartItemCount);
  const activeHref = customerPrimaryNavigation.find((item) =>
    pathname.startsWith(item.href),
  )?.href;

  return (
      <ShellRoot>
        <CustomerHeader
          accountHref="/customer/account"
          activeHref={activeHref}
          brandName="MRJE Gas + Bright Star Water"
          cartCount={itemCount}
          cartHref="/customer/cart"
          megaMenuGroups={customerMegaMenuGroups}
          navigation={customerPrimaryNavigation}
          searchHref="/shop"
        />
        <PrototypeBanner>
          <PrototypeBannerInner>
            Prototype workspace. All customer, address, payment and delivery data is fictional.
          </PrototypeBannerInner>
        </PrototypeBanner>
        <Main id="main-content">{children}</Main>
        <CustomerFooter
          brandName="MRJE Gas + Bright Star Water"
          contactLines={['Demo contact: 09XX-000-0000', 'Sample City, Laguna (Demo)']}
          groups={FOOTER_GROUPS}
          legalText="Frontend prototype only. No real order, payment or delivery is created."
          summary="Household LPG and purified water prepared for clear, local delivery."
        />
      </ShellRoot>
  );
}

export type { CartLine, CustomerCartContextValue } from './interface';

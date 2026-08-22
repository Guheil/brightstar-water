// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { act, cleanup, render, screen, waitForElementToBeRemoved, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MUIStyleProvider } from '@/theme';
import { useAppStore } from '@/store';
import { authenticateCustomerFixture } from '@/test-utils/auth';
import { hydrateCatalogFixtures } from '@/test-utils/catalog';
import ProductDetailScreen from './ProductDetailScreen';
import ShopScreen from './ShopScreen';

vi.mock('next/navigation', () => ({
  usePathname: () => '/brightstar/shop',
}));

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  useAppStore.getState().commands.resetAppState();
  hydrateCatalogFixtures();
});

function renderProductDetail() {
  return render(
    <MUIStyleProvider>
      <ProductDetailScreen
        expectedCategory="water"
        productId="product-water-refill"
        shopHref="/brightstar/shop"
      />
    </MUIStyleProvider>,
  );
}

describe('customer add-to-cart confirmation flow', () => {
  it('keeps sign-in gating ahead of cart confirmation for guests', async () => {
    const user = userEvent.setup();

    render(
      <MUIStyleProvider>
        <ShopScreen lockedCategory="water" productHrefPrefix="/brightstar/product" />
      </MUIStyleProvider>,
    );

    const productHeading = screen.getByRole('heading', { name: 'Manual Dispenser Pump' });
    const productCard = productHeading.closest('article');
    expect(productCard).not.toBeNull();

    await user.click(within(productCard as HTMLElement).getByRole('button', { name: 'Add to cart' }));

    expect(screen.getByRole('heading', { name: 'Sign in before starting your order' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Add to cart?' })).not.toBeInTheDocument();
    expect(useAppStore.getState().cart.items).toEqual([]);
  });

  it('lets a customer choose the quantity from a shop-card confirmation before adding', async () => {
    const user = userEvent.setup();
    authenticateCustomerFixture();

    render(
      <MUIStyleProvider>
        <ShopScreen lockedCategory="water" productHrefPrefix="/brightstar/product" />
      </MUIStyleProvider>,
    );

    const productHeading = screen.getByRole('heading', { name: 'Manual Dispenser Pump' });
    const productCard = productHeading.closest('article');
    expect(productCard).not.toBeNull();

    await user.click(
      within(productCard as HTMLElement).getByRole('button', { name: 'Add to cart' }),
    );

    const confirmation = screen.getByRole('dialog', { name: 'Add to cart?' });
    const summary = within(confirmation).getByRole('group', { name: 'Cart addition summary' });

    await user.click(
      within(summary).getByRole('button', { name: 'Increase manual dispenser pump quantity' }),
    );
    await user.click(
      within(summary).getByRole('button', { name: 'Increase manual dispenser pump quantity' }),
    );

    expect(
      within(summary).getByRole('group', { name: 'Manual Dispenser Pump quantity: 3' }),
    ).toBeInTheDocument();
    expect(within(summary).getByText('₱540.00')).toBeInTheDocument();

    await user.click(within(confirmation).getByRole('button', { name: 'Add to cart' }));

    expect(
      useAppStore.getState().cart.items.find((item) => item.productId === 'product-water-pump')?.quantity,
    ).toBe(3);
    expect(screen.getByRole('status')).toHaveTextContent(
      '3 × Manual Dispenser Pump added to your cart.',
    );
  });

  it('cancels safely, preserves quantity on confirm, shows a success toast, and supports repeated additions', async () => {
    const user = userEvent.setup();
    authenticateCustomerFixture();
    renderProductDetail();

    await user.click(screen.getByRole('button', { name: 'Increase 5 gallon purified water refill' }));
    await user.click(screen.getByRole('button', { name: 'Increase 5 gallon purified water refill' }));

    const primaryAddButton = screen.getByRole('button', { name: /Add .* to cart/ });
    await user.click(primaryAddButton);

    const confirmation = screen.getByRole('dialog', { name: 'Add to cart?' });
    const summary = within(confirmation).getByRole('group', { name: 'Cart addition summary' });
    expect(within(summary).getByText('5 Gallon Purified Water Refill')).toBeInTheDocument();
    expect(within(summary).getByRole('group', { name: '5 Gallon Purified Water Refill quantity: 3' })).toBeInTheDocument();

    await user.click(
      within(summary).getByRole('button', { name: 'Increase 5 gallon purified water refill quantity' }),
    );
    expect(within(summary).getByRole('group', { name: '5 Gallon Purified Water Refill quantity: 4' })).toBeInTheDocument();
    expect(within(summary).getByText('₱140.00')).toBeInTheDocument();

    await user.click(within(confirmation).getByRole('button', { name: 'Cancel' }));
    expect(useAppStore.getState().cart.items).toEqual([]);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    await waitForElementToBeRemoved(() => screen.queryByRole('dialog', { name: 'Add to cart?' }));

    await user.click(primaryAddButton);
    const secondConfirmation = screen.getByRole('dialog', { name: 'Add to cart?' });
    const secondSummary = within(secondConfirmation).getByRole('group', { name: 'Cart addition summary' });
    await user.click(
      within(secondSummary).getByRole('button', { name: 'Increase 5 gallon purified water refill quantity' }),
    );
    await user.click(within(secondConfirmation).getByRole('button', { name: 'Add to cart' }));

    expect(
      useAppStore.getState().cart.items.find((item) => item.productId === 'product-water-refill')?.quantity,
    ).toBe(4);
    expect(screen.getByRole('status')).toHaveTextContent('4 × 5 Gallon Purified Water Refill added to your cart.');
    await waitForElementToBeRemoved(() => screen.queryByRole('dialog', { name: 'Add to cart?' }));

    await user.click(primaryAddButton);
    await user.click(within(screen.getByRole('dialog', { name: 'Add to cart?' })).getByRole('button', { name: 'Add to cart' }));

    expect(
      useAppStore.getState().cart.items.find((item) => item.productId === 'product-water-refill')?.quantity,
    ).toBe(8);
    expect(screen.getByRole('status')).toHaveTextContent('4 × 5 Gallon Purified Water Refill added to your cart.');
  });

  it('does not show a success toast when the cart command fails after confirmation opens', async () => {
    const user = userEvent.setup();
    authenticateCustomerFixture();
    renderProductDetail();

    await user.click(screen.getByRole('button', { name: /Add .* to cart/ }));
    expect(screen.getByRole('dialog', { name: 'Add to cart?' })).toBeInTheDocument();

    act(() => {
      useAppStore.getState().commands.signOut();
    });

    await user.click(within(screen.getByRole('dialog', { name: 'Add to cart?' })).getByRole('button', { name: 'Add to cart' }));

    expect(useAppStore.getState().cart.items).toEqual([]);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});

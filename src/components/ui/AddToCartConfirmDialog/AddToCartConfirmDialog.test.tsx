// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MUIStyleProvider } from '@/theme';
import AddToCartConfirmDialog from './index';

afterEach(cleanup);

describe('AddToCartConfirmDialog', () => {
  it('shows the selected product and lets the customer adjust quantity before confirming', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    const onQuantityChange = vi.fn();

    render(
      <MUIStyleProvider>
        <AddToCartConfirmDialog
          maxQuantity={5}
          onClose={onClose}
          onConfirm={onConfirm}
          onQuantityChange={onQuantityChange}
          open
          productName="11 kg LPG Refill"
          quantity={2}
          subtotalLabel="₱1,700.00"
        />
      </MUIStyleProvider>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Add to cart?' });
    const summary = within(dialog).getByRole('group', { name: 'Cart addition summary' });

    expect(within(summary).getByText('11 kg LPG Refill')).toBeInTheDocument();
    expect(within(summary).getByRole('group', { name: '11 kg LPG Refill quantity: 2' })).toBeInTheDocument();
    expect(within(summary).getByText('₱1,700.00')).toBeInTheDocument();

    await user.click(
      within(summary).getByRole('button', { name: 'Increase 11 kg lpg refill quantity' }),
    );
    expect(onQuantityChange).toHaveBeenCalledWith(3);

    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});

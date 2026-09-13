// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitForElementToBeRemoved, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MUIStyleProvider } from '@/theme';
import HelpCenter from './index';

vi.mock('next/navigation', () => ({
  usePathname: () => '/customer/checkout',
}));

afterEach(() => cleanup());

function renderHelpCenter() {
  return render(
    <MUIStyleProvider>
      <HelpCenter />
    </MUIStyleProvider>,
  );
}

describe('HelpCenter', () => {
  it('opens as a focused help surface with contextual recommendations', async () => {
    const user = userEvent.setup();
    renderHelpCenter();

    await user.click(screen.getByRole('button', { name: 'Open help' }));

    const dialog = screen.getByRole('dialog', { name: 'Help' });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText('Recommended for this page')).toBeInTheDocument();
    expect(within(dialog).getByText('Browse all questions')).toBeInTheDocument();
    expect(within(dialog).getByText('Can I schedule my delivery?')).toBeInTheDocument();
  });

  it('keeps wheel and touch scrolling inside the FAQ results region', async () => {
    const user = userEvent.setup();
    renderHelpCenter();

    await user.click(screen.getByRole('button', { name: 'Open help' }));

    const questions = screen.getByRole('region', { name: 'Help questions' });
    expect(questions).toHaveAttribute('data-lenis-prevent');
  });

  it('searches across FAQ content and expands one answer', async () => {
    const user = userEvent.setup();
    renderHelpCenter();

    await user.click(screen.getByRole('button', { name: 'Open help' }));
    const dialog = screen.getByRole('dialog', { name: 'Help' });

    await user.type(within(dialog).getByRole('searchbox', { name: 'Search questions' }), 'delivery fee');
    expect(within(dialog).getByText('Search results')).toBeInTheDocument();
    expect(within(dialog).getByText('How are delivery fees calculated?')).toBeInTheDocument();

    await user.click(within(dialog).getByText('How are delivery fees calculated?'));
    expect(within(dialog).getByText(/Delivery is free up to 3 km/)).toBeVisible();
  });

  it('filters by category without leaving contextual content mixed into the list', async () => {
    const user = userEvent.setup();
    renderHelpCenter();

    await user.click(screen.getByRole('button', { name: 'Open help' }));
    const dialog = screen.getByRole('dialog', { name: 'Help' });

    await user.click(within(dialog).getByRole('button', { name: 'Payments' }));

    expect(within(dialog).getByRole('heading', { name: 'Payments' })).toBeInTheDocument();
    expect(within(dialog).getByText('How does GCash payment work?')).toBeInTheDocument();
    expect(within(dialog).queryByText('Recommended for this page')).not.toBeInTheDocument();
  });

  it('shows a useful empty state and closes from the panel control', async () => {
    const user = userEvent.setup();
    renderHelpCenter();

    await user.click(screen.getByRole('button', { name: 'Open help' }));
    const dialog = screen.getByRole('dialog', { name: 'Help' });

    await user.type(within(dialog).getByRole('searchbox', { name: 'Search questions' }), 'zzzz-no-result');
    expect(within(dialog).getByText('No matching questions')).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Close help' }));
    await waitForElementToBeRemoved(() => screen.queryByRole('dialog', { name: 'Help' }));
  });
});

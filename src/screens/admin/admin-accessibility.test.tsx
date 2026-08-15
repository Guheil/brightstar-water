import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MUIStyleProvider from '@/theme/MUIStyleProvider';
import { useAppStore } from '@/store';
import AccountScreen from './AccountScreen';
import AdminConfirmDialog from './components/AdminConfirmDialog';
import AdminDataTable from './components/AdminDataTable';
import InventoryScreen from './InventoryScreen';
import ProductsScreen from './ProductsScreen';

const renderWithTheme = (ui: React.ReactNode) =>
  render(<MUIStyleProvider>{ui}</MUIStyleProvider>);

beforeEach(() => {
  useAppStore.getState().commands.resetDemoState();
});

describe('Admin responsive and confirmation semantics', () => {
  it('provides both a labelled desktop table and structured mobile list', () => {
    renderWithTheme(
      <AdminDataTable
        ariaLabel="QA records"
        columns={[
          { key: 'name', label: 'Name', render: (row: { id: string; name: string }) => row.name },
          { key: 'state', label: 'State', render: () => 'Pending' },
        ]}
        getRowKey={(row) => row.id}
        rows={[{ id: 'one', name: 'First record' }]}
      />,
    );

    expect(screen.getByRole('table', { name: 'QA records' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    const mobileList = screen.getByRole('list', { hidden: true });
    expect(mobileList).toHaveAttribute('aria-label', 'QA records, mobile list');
    expect(screen.getByRole('listitem', { hidden: true }))
      .toHaveTextContent('NameFirst recordStatePending');
  });

  it('exposes an accessible dialog name, consequence, and explicit actions', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    renderWithTheme(
      <AdminConfirmDialog
        confirmLabel="Apply change"
        description="This changes shared fictional state."
        onClose={onClose}
        onConfirm={onConfirm}
        open
        title="Confirm this change?"
      />,
    );

    const dialog = screen.getByRole('dialog', { name: 'Confirm this change?' });
    expect(dialog).toHaveAccessibleDescription('This changes shared fictional state.');
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apply change' })).toBeInTheDocument();
  });

  it('presents the administrator session without demo controls or disclaimers', () => {
    const { container } = renderWithTheme(<AccountScreen />);

    expect(screen.getByRole('heading', { name: 'Admin account' })).toBeInTheDocument();
    expect(screen.getByText('Current session')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /reset/i })).not.toBeInTheDocument();
    expect(container).not.toHaveTextContent(
      /demo|fictional|prototype|simulated|frontend-only/i,
    );
  });

  it('renders the product catalog without a recursive store snapshot update', () => {
    renderWithTheme(<ProductsScreen />);

    expect(screen.getByRole('heading', { name: 'Products' })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Product catalog' })).toBeInTheDocument();
  });

  it('renders inventory from the same stable product derivation', () => {
    renderWithTheme(<InventoryScreen />);

    expect(screen.getByRole('heading', { name: 'Inventory' })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Current inventory' })).toBeInTheDocument();
  });
});

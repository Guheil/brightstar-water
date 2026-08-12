import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { MUIStyleProvider } from '@/theme';
import QuantityControl from './index';

function Harness() {
  const [value, setValue] = useState(1);
  return <QuantityControl value={value} min={1} max={2} onChange={setValue} />;
}

describe('QuantityControl', () => {
  it('announces and enforces its quantity bounds', async () => {
    const user = userEvent.setup();
    render(
      <MUIStyleProvider>
        <Harness />
      </MUIStyleProvider>,
    );

    expect(screen.getByRole('button', { name: 'Decrease quantity' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Increase quantity' }));
    expect(screen.getByRole('group', { name: 'Quantity: 2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Increase quantity' })).toBeDisabled();
  });
});

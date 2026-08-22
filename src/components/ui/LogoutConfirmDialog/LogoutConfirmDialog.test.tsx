import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MUIStyleProvider } from '@/theme';
import { dialogMotion } from '@/theme/transitions';
import LogoutConfirmDialog from './index';

vi.mock('gsap', () => ({
  default: {
    killTweensOf: vi.fn(),
    set: vi.fn(),
    timeline: vi.fn(() => {
      const timeline = {
        kill: vi.fn(),
        to: vi.fn(),
      };
      timeline.to.mockImplementation(() => timeline);
      return timeline;
    }),
  },
}));

describe('LogoutConfirmDialog transition integration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps the page scroll lock until the exit transition has completed', () => {
    const { rerender } = render(
      <MUIStyleProvider>
        <LogoutConfirmDialog
          description="You can sign in again later."
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          open
          title="Log out?"
        />
      </MUIStyleProvider>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Log out?' });
    expect(dialog).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');
    expect(dialog.closest('.MuiDialog-container')).toHaveAttribute('data-dialog-motion-state', 'entering');

    rerender(
      <MUIStyleProvider>
        <LogoutConfirmDialog
          description="You can sign in again later."
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          open={false}
          title="Log out?"
        />
      </MUIStyleProvider>,
    );

    expect(document.body.style.overflow).toBe('hidden');

    act(() => {
      vi.advanceTimersByTime(dialogMotion.exitDuration - 1);
    });
    expect(document.body.style.overflow).toBe('hidden');

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(document.body.style.overflow).not.toBe('hidden');
  });
});

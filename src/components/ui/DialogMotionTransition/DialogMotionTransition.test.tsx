import { act, render } from '@testing-library/react';
import gsap from 'gsap';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { dialogMotion } from '@/theme/transitions';
import DialogMotionTransition from './index';

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

function TransitionFixture({ open = true }: { open?: boolean }) {
  return (
    <DialogMotionTransition in={open}>
      <div data-testid="motion-root">
        <div className="MuiDialog-paper">
          <div data-modal-icon />
          <span data-modal-title-text>Title</span>
          <div data-modal-body />
          <div data-modal-actions />
        </div>
      </div>
    </DialogMotionTransition>
  );
}

describe('DialogMotionTransition', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps the transition container fully opaque and prepares the paper before entry', () => {
    const { getByTestId } = render(<TransitionFixture />);
    const root = getByTestId('motion-root');
    const paper = root.querySelector<HTMLElement>('.MuiDialog-paper');
    const body = root.querySelector<HTMLElement>('[data-modal-body]');
    const actions = root.querySelector<HTMLElement>('[data-modal-actions]');

    expect(root.style.opacity).toBe('');
    expect(root.dataset.dialogMotionState).toBe('entering');
    expect(gsap.set).toHaveBeenCalledWith(
      paper,
      expect.objectContaining({
        opacity: 1,
        visibility: 'visible',
        y: dialogMotion.enterOffset,
      }),
    );

    // Content only fades. It no longer translates beyond the paper and cannot
    // temporarily expand the paper's scrollable overflow region.
    expect(gsap.set).toHaveBeenCalledWith(
      body,
      expect.objectContaining({ autoAlpha: 0 }),
    );
    expect(gsap.set).toHaveBeenCalledWith(
      actions,
      expect.objectContaining({ autoAlpha: 0 }),
    );
    expect(gsap.set).not.toHaveBeenCalledWith(
      body,
      expect.objectContaining({ y: expect.any(Number) }),
    );
    expect(gsap.set).not.toHaveBeenCalledWith(
      actions,
      expect.objectContaining({ y: expect.any(Number) }),
    );
  });

  it('does not report exit completion until the configured exit transition finishes', () => {
    const onEnter = vi.fn();
    const onExit = vi.fn();
    const onExited = vi.fn();

    const { rerender } = render(
      <DialogMotionTransition in onEnter={onEnter} onExit={onExit} onExited={onExited}>
        <div>
          <div className="MuiDialog-paper">
            <div data-modal-icon />
            <span data-modal-title-text />
            <div data-modal-body />
            <div data-modal-actions />
          </div>
        </div>
      </DialogMotionTransition>,
    );

    expect(onEnter).toHaveBeenCalledTimes(1);

    rerender(
      <DialogMotionTransition in={false} onEnter={onEnter} onExit={onExit} onExited={onExited}>
        <div>
          <div className="MuiDialog-paper">
            <div data-modal-icon />
            <span data-modal-title-text />
            <div data-modal-body />
            <div data-modal-actions />
          </div>
        </div>
      </DialogMotionTransition>,
    );

    expect(onExit).toHaveBeenCalledTimes(1);
    expect(onExited).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(dialogMotion.exitDuration - 1);
    });
    expect(onExited).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onExited).toHaveBeenCalledTimes(1);
  });

  it('still completes the MUI lifecycle when reduced motion is requested', () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });

    const onExited = vi.fn();
    const { rerender } = render(
      <DialogMotionTransition in onExited={onExited}>
        <div><div className="MuiDialog-paper" /></div>
      </DialogMotionTransition>,
    );

    rerender(
      <DialogMotionTransition in={false} onExited={onExited}>
        <div><div className="MuiDialog-paper" /></div>
      </DialogMotionTransition>,
    );

    act(() => {
      vi.advanceTimersByTime(dialogMotion.exitDuration);
    });
    expect(onExited).toHaveBeenCalledTimes(1);

    window.matchMedia = originalMatchMedia;
  });
});

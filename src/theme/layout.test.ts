import { describe, expect, it } from 'vitest';
import { layout } from './layout';

describe('layout contract', () => {
  it('caps application content at 1440px', () => {
    expect(layout.maxContentWidth).toBe(1440);
  });

  it('keeps responsive gutters smaller than the content cap', () => {
    expect(layout.desktopGutter).toBeLessThan(layout.maxContentWidth);
    expect(layout.tabletGutter).toBeLessThan(layout.maxContentWidth);
    expect(layout.mobileGutter).toBeLessThan(layout.maxContentWidth);
  });
});

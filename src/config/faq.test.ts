import { describe, expect, it } from 'vitest';
import { getFaqItemsForContext, searchFaqItems } from './faq';

describe('FAQ context and search', () => {
  it('prioritizes checkout questions on the checkout route', () => {
    const items = getFaqItemsForContext({ pathname: '/customer/checkout' });
    const firstSeven = items.slice(0, 7).map((item) => item.id);

    expect(firstSeven).toContain('schedule-delivery');
    expect(firstSeven).toContain('payment-methods');
    expect(firstSeven).toContain('place-order');
  });

  it('hides the other storefront product FAQ on a branded route', () => {
    const mrjeItems = getFaqItemsForContext({ pathname: '/mrje/shop', brandKey: 'mrje' });
    const brightStarItems = getFaqItemsForContext({
      pathname: '/brightstar/shop',
      brandKey: 'brightstar',
    });

    expect(mrjeItems.some((item) => item.id === 'mrje-availability')).toBe(true);
    expect(mrjeItems.some((item) => item.id === 'brightstar-availability')).toBe(false);
    expect(brightStarItems.some((item) => item.id === 'brightstar-availability')).toBe(true);
    expect(brightStarItems.some((item) => item.id === 'mrje-availability')).toBe(false);
  });

  it('matches all search terms across questions, answers, and keywords', () => {
    const items = getFaqItemsForContext({ pathname: '/customer/orders' });
    const results = searchFaqItems(items, 'cancel admin');

    expect(results.map((item) => item.id)).toContain('cancel-order');
    expect(searchFaqItems(items, 'not-a-real-question')).toHaveLength(0);
  });
});

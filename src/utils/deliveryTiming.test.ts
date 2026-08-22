import { describe, expect, it } from 'vitest';
import {
  buildDeliverySchedule,
  calculateEstimatedDelivery,
  getAvailablePreferredWindows,
  getPreferredDateBounds,
  validateDeliverySchedule,
} from './deliveryTiming';

describe('delivery timing', () => {
  it('moves an afternoon order to the next morning when preparation would miss the final window', () => {
    const estimate = calculateEstimatedDelivery(3.68, new Date('2026-08-22T06:04:00.000Z'));
    expect(estimate).toEqual({
      date: '2026-08-23',
      windowId: 'morning',
      windowLabel: '9:00 AM to 12:00 PM',
    });
  });

  it('uses the next same-day window when enough time remains', () => {
    const estimate = calculateEstimatedDelivery(2, new Date('2026-08-22T00:00:00.000Z'));
    expect(estimate.date).toBe('2026-08-22');
    expect(estimate.windowId).toBe('afternoon');
  });

  it('keeps preferred scheduling optional', () => {
    const estimate = { date: '2026-08-23', windowId: 'morning' as const, windowLabel: '9:00 AM to 12:00 PM' };
    expect(buildDeliverySchedule({ estimate })).toMatchObject({
      mode: 'earliest_available',
      date: '2026-08-23',
      estimatedDate: '2026-08-23',
    });
  });

  it('supports a custom preferred date with any available time', () => {
    const estimate = { date: '2026-08-23', windowId: 'morning' as const, windowLabel: '9:00 AM to 12:00 PM' };
    expect(buildDeliverySchedule({ estimate, preferredDate: '2026-08-25', preferredWindowId: 'any' })).toMatchObject({
      mode: 'preferred',
      date: '2026-08-25',
      windowLabel: 'Any available time',
      preferredDate: '2026-08-25',
    });
  });

  it('limits custom dates to fourteen days from the earliest estimate', () => {
    expect(getPreferredDateBounds('2026-08-23')).toEqual({ min: '2026-08-23', max: '2026-09-06' });
  });

  it('removes earlier windows when the earliest estimate is already afternoon', () => {
    const estimate = { date: '2026-08-22', windowId: 'afternoon' as const, windowLabel: '1:00 PM to 4:00 PM' };
    expect(getAvailablePreferredWindows('2026-08-22', estimate).map((item) => item.id)).toEqual(['afternoon']);
  });

  it('rejects preferred dates before the current earliest estimate', () => {
    const error = validateDeliverySchedule({
      mode: 'preferred',
      date: '2026-08-21',
      windowLabel: 'Any available time',
      preferredDate: '2026-08-21',
      preferredWindowLabel: 'Any available time',
    }, 3.68, new Date('2026-08-22T06:04:00.000Z'));
    expect(error).toContain('outside the available booking range');
  });
});

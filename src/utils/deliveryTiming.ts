import { DELIVERY_TIMING_CONFIG, type DeliveryWindowConfig } from '@/config';
import type { DeliverySchedule } from '@/types';

export type DeliveryWindowId = DeliveryWindowConfig['id'];
export type PreferredWindowId = 'any' | DeliveryWindowId;

export interface DeliveryEstimate {
  date: string;
  windowId: DeliveryWindowId;
  windowLabel: string;
}

interface ManilaParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

const manilaFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: DELIVERY_TIMING_CONFIG.timeZone,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const getManilaParts = (date: Date): ManilaParts => {
  const values = Object.fromEntries(
    manilaFormatter
      .formatToParts(date)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, Number(part.value)]),
  );
  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
  };
};

const toIsoDate = (year: number, month: number, day: number): string =>
  `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

export const addDaysToIsoDate = (isoDate: string, days: number): string => {
  const [year, month, day] = isoDate.split('-').map(Number);
  const value = new Date(Date.UTC(year, month - 1, day + days));
  return toIsoDate(value.getUTCFullYear(), value.getUTCMonth() + 1, value.getUTCDate());
};

const getDistanceBufferMinutes = (distanceKm: number): number =>
  DELIVERY_TIMING_CONFIG.distanceBuffers.find((band) => distanceKm <= band.maxKm)?.minutes
  ?? DELIVERY_TIMING_CONFIG.distanceBuffers.at(-1)?.minutes
  ?? 90;

export const calculateEstimatedDelivery = (
  distanceKm: number,
  now: Date = new Date(),
): DeliveryEstimate => {
  const parts = getManilaParts(now);
  const currentDate = toIsoDate(parts.year, parts.month, parts.day);
  const readyMinute = parts.hour * 60
    + parts.minute
    + DELIVERY_TIMING_CONFIG.baseProcessingMinutes
    + getDistanceBufferMinutes(distanceKm);

  const sameDayWindow = DELIVERY_TIMING_CONFIG.windows.find(
    (window) => window.startMinute >= readyMinute,
  );

  const window = sameDayWindow ?? DELIVERY_TIMING_CONFIG.windows[0];
  return {
    date: sameDayWindow ? currentDate : addDaysToIsoDate(currentDate, 1),
    windowId: window.id,
    windowLabel: window.label,
  };
};

export const formatDeliveryDate = (isoDate: string): string => {
  const [year, month, day] = isoDate.split('-').map(Number);
  const value = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat('en-PH', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(value);
};

export const getPreferredDateBounds = (estimateDate: string) => ({
  min: estimateDate,
  max: addDaysToIsoDate(estimateDate, DELIVERY_TIMING_CONFIG.customDateMaxDays),
});

export const getAvailablePreferredWindows = (
  preferredDate: string,
  estimate: DeliveryEstimate,
): readonly DeliveryWindowConfig[] => {
  if (preferredDate !== estimate.date) return DELIVERY_TIMING_CONFIG.windows;
  const earliestIndex = DELIVERY_TIMING_CONFIG.windows.findIndex((window) => window.id === estimate.windowId);
  return DELIVERY_TIMING_CONFIG.windows.slice(Math.max(0, earliestIndex));
};

export const buildDeliverySchedule = ({
  estimate,
  preferredDate,
  preferredWindowId,
}: {
  estimate: DeliveryEstimate;
  preferredDate?: string;
  preferredWindowId?: PreferredWindowId;
}): DeliverySchedule => {
  if (!preferredDate) {
    return {
      date: estimate.date,
      windowLabel: estimate.windowLabel,
      mode: 'earliest_available',
      estimatedDate: estimate.date,
      estimatedWindowLabel: estimate.windowLabel,
    };
  }

  const preferredWindowLabel = preferredWindowId && preferredWindowId !== 'any'
    ? DELIVERY_TIMING_CONFIG.windows.find((window) => window.id === preferredWindowId)?.label ?? 'Any available time'
    : 'Any available time';

  return {
    date: preferredDate,
    windowLabel: preferredWindowLabel,
    mode: 'preferred',
    estimatedDate: estimate.date,
    estimatedWindowLabel: estimate.windowLabel,
    preferredDate,
    preferredWindowLabel,
  };
};

export const getEstimatedScheduleText = (schedule: DeliverySchedule): string => {
  const date = schedule.estimatedDate ?? schedule.date;
  const windowLabel = schedule.estimatedWindowLabel ?? schedule.windowLabel;
  return `${formatDeliveryDate(date)} · ${windowLabel}`;
};

export const getPreferredScheduleText = (schedule: DeliverySchedule): string | null => {
  if (schedule.mode !== 'preferred' && !schedule.preferredDate) return null;
  const date = schedule.preferredDate ?? schedule.date;
  const windowLabel = schedule.preferredWindowLabel ?? schedule.windowLabel;
  return `${formatDeliveryDate(date)} · ${windowLabel}`;
};

export const getEffectiveScheduleText = (schedule: DeliverySchedule): string =>
  getPreferredScheduleText(schedule) ?? getEstimatedScheduleText(schedule);

export const validateDeliverySchedule = (
  schedule: DeliverySchedule,
  distanceKm: number,
  now: Date = new Date(),
): string | null => {
  if (!schedule.mode) return null;
  const estimate = calculateEstimatedDelivery(distanceKm, now);

  if (schedule.mode === 'earliest_available') return null;
  if (!schedule.preferredDate) return 'Choose a preferred delivery date.';

  const bounds = getPreferredDateBounds(estimate.date);
  if (schedule.preferredDate < bounds.min || schedule.preferredDate > bounds.max) {
    return 'The preferred delivery date is outside the available booking range.';
  }

  const label = schedule.preferredWindowLabel ?? 'Any available time';
  if (label === 'Any available time') return null;

  const availableLabels = getAvailablePreferredWindows(schedule.preferredDate, estimate)
    .map((window) => window.label);
  if (!availableLabels.includes(label)) {
    return 'The preferred delivery time is no longer available for that date.';
  }

  return null;
};

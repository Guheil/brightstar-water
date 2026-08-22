export interface DeliveryWindowConfig {
  id: 'morning' | 'afternoon';
  label: string;
  startMinute: number;
  endMinute: number;
}

export const DELIVERY_TIMING_CONFIG = {
  timeZone: 'Asia/Manila',
  baseProcessingMinutes: 90,
  customDateMaxDays: 14,
  windows: [
    { id: 'morning', label: '9:00 AM to 12:00 PM', startMinute: 9 * 60, endMinute: 12 * 60 },
    { id: 'afternoon', label: '1:00 PM to 4:00 PM', startMinute: 13 * 60, endMinute: 16 * 60 },
  ] satisfies readonly DeliveryWindowConfig[],
  distanceBuffers: [
    { maxKm: 3, minutes: 30 },
    { maxKm: 6, minutes: 60 },
    { maxKm: 10, minutes: 90 },
  ] as const,
} as const;

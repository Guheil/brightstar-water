import type { StatusTone } from '@/components/ui';

export const ADMIN_ACTOR_ID = 'user-admin-01';

const dateFormatter = new Intl.DateTimeFormat('en-PH', {
  dateStyle: 'medium',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-PH', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
};

export const formatDateTime = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateTimeFormatter.format(date);
};

export const humanize = (value: string) =>
  value
    .split('_')
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');

export const getStatusTone = (status: string): StatusTone => {
  if (['delivered', 'paid', 'verified', 'approved', 'refunded', 'active'].includes(status)) {
    return 'success';
  }
  if (['cancelled', 'failed', 'delivery_failed', 'rejected', 'inactive'].includes(status)) {
    return 'error';
  }
  if (
    [
      'pending_review',
      'awaiting_verification',
      'pending',
      'processing',
      'requested',
      'unassigned',
    ].includes(status)
  ) {
    return 'warning';
  }
  if (['out_for_delivery', 'assigned', 'accepted', 'assigned_for_delivery'].includes(status)) {
    return 'water';
  }
  return 'neutral';
};

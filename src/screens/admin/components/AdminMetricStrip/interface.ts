export type AdminMetricTone = 'neutral' | 'gas' | 'water' | 'warning' | 'error' | 'success';

export interface AdminMetricItem {
  label: string;
  tone?: AdminMetricTone;
  value: string | number;
}

export interface AdminMetricStripProps {
  ariaLabel: string;
  items: readonly AdminMetricItem[];
}

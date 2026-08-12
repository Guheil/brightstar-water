export type CustomerOrderFilter = 'all' | 'active' | 'completed' | 'exceptions';

export interface OrderFilterOption {
  id: CustomerOrderFilter;
  label: string;
}

export interface FilterVisualProps {
  $active: boolean;
}


import type { LucideIcon } from 'lucide-react';

export interface AdminEntityAction {
  disabled?: boolean;
  icon?: LucideIcon;
  label: string;
  onSelect: () => void;
  tone?: 'default' | 'danger';
}

export interface AdminEntityActionMenuProps {
  actions: readonly AdminEntityAction[];
  ariaLabel: string;
}

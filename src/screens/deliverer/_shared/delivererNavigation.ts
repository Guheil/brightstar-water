import type { AppStore } from '@/store/interface';

export const delivererNavigation = [
  { label: 'Home', href: '/deliverer', icon: 'home' as const },
  { label: 'Deliveries', href: '/deliverer/deliveries', icon: 'active' as const },
  { label: 'History', href: '/deliverer/history', icon: 'history' as const },
  { label: 'Profile', href: '/deliverer/profile', icon: 'profile' as const },
];

export const getActiveDelivererId = (state: AppStore): string =>
  state.auth.session?.user.role === 'deliverer' ? state.auth.session.user.delivererId ?? state.auth.session.user.id : '';

export interface AuthRouteStateScreenProps {
  mode: 'loading' | 'error';
  onRetry?: () => void;
}

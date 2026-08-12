export interface PublicRouteStateScreenProps {
  mode: 'loading' | 'error';
  onRetry?: () => void;
}

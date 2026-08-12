export interface ErrorStateProps {
  className?: string;
  description: string;
  onRetry?: () => void;
  retryLabel?: string;
  title?: string;
}

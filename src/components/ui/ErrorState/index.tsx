import { CircleAlert, RotateCcw } from 'lucide-react';
import {
  Description,
  IconSlot,
  RetryButton,
  Root,
  Title,
} from './elements';
import type { ErrorStateProps } from './interface';

export default function ErrorState({
  className,
  description,
  onRetry,
  retryLabel = 'Try again',
  title = 'Something went wrong',
}: ErrorStateProps) {
  return (
    <Root className={className} role="alert">
      <IconSlot aria-hidden="true">
        <CircleAlert />
      </IconSlot>
      <Title>{title}</Title>
      <Description>{description}</Description>
      {onRetry ? (
        <RetryButton onClick={onRetry} startIcon={<RotateCcw />}>
          {retryLabel}
        </RetryButton>
      ) : null}
    </Root>
  );
}

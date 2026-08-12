import { Description, Label, Progress, Root } from './elements';
import type { LoadingStateProps } from './interface';

export default function LoadingState({
  className,
  compact = false,
  description,
  label = 'Loading',
}: LoadingStateProps) {
  return (
    <Root
      aria-live="polite"
      className={className}
      role="status"
      $compact={compact}
    >
      <Progress aria-hidden="true" />
      <Label>{label}</Label>
      {description ? <Description>{description}</Description> : null}
    </Root>
  );
}

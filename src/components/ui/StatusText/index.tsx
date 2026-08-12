import { Root } from './elements';
import type { StatusTextProps } from './interface';

export default function StatusText({
  children,
  className,
  tone = 'neutral',
}: StatusTextProps) {
  return (
    <Root className={className} $tone={tone}>
      {children}
    </Root>
  );
}

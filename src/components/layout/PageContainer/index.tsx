import { Root } from './elements';
import type { PageContainerProps } from './interface';

export default function PageContainer({
  children,
  className,
  id,
}: PageContainerProps) {
  return (
    <Root className={className} id={id}>
      {children}
    </Root>
  );
}

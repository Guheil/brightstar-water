import { PackageOpen } from 'lucide-react';
import { ActionSlot, Description, IconSlot, Root, Title } from './elements';
import type { EmptyStateProps } from './interface';

export default function EmptyState({
  action,
  className,
  description,
  icon,
  title,
}: EmptyStateProps) {
  return (
    <Root className={className}>
      <IconSlot aria-hidden="true">{icon ?? <PackageOpen />}</IconSlot>
      <Title>{title}</Title>
      <Description>{description}</Description>
      {action ? <ActionSlot>{action}</ActionSlot> : null}
    </Root>
  );
}

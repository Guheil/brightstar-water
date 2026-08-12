import { Actions, BackLink, Copy, Description, Root, Title } from './elements';
import type { AdminPageHeaderProps } from './interface';

export default function AdminPageHeader({
  actions,
  backHref,
  backLabel = 'Back',
  description,
  title,
}: AdminPageHeaderProps) {
  return (
    <Root>
      <Copy>
        {backHref ? <BackLink href={backHref}>{backLabel}</BackLink> : null}
        <Title>{title}</Title>
        <Description>{description}</Description>
      </Copy>
      {actions ? <Actions>{actions}</Actions> : null}
    </Root>
  );
}

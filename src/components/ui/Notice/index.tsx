import {
  CircleCheck,
  CircleX,
  Info,
  MessageCircle,
  TriangleAlert,
} from 'lucide-react';
import {
  ActionSlot,
  Content,
  IconSlot,
  Message,
  Root,
  Title,
} from './elements';
import type { NoticeProps, NoticeTone } from './interface';

function getIcon(tone: NoticeTone) {
  switch (tone) {
    case 'info':
      return <Info />;
    case 'success':
      return <CircleCheck />;
    case 'warning':
      return <TriangleAlert />;
    case 'error':
      return <CircleX />;
    default:
      return <MessageCircle />;
  }
}

export default function Notice({
  action,
  children,
  className,
  title,
  tone = 'neutral',
}: NoticeProps) {
  const role = tone === 'error' || tone === 'warning' ? 'alert' : 'status';

  return (
    <Root className={className} role={role} $tone={tone}>
      <IconSlot aria-hidden="true" $tone={tone}>
        {getIcon(tone)}
      </IconSlot>
      <Content>
        {title ? <Title>{title}</Title> : null}
        <Message>{children}</Message>
      </Content>
      {action ? <ActionSlot>{action}</ActionSlot> : null}
    </Root>
  );
}

import {
  Action,
  Description,
  Root,
  Title,
} from './elements';

import type { ExampleComponentProps } from './interface';

export default function ExampleComponent({
  title,
  description,
  onAction,
}: ExampleComponentProps) {
  return (
    <Root>
      <Title>{title}</Title>

      {description ? (
        <Description>{description}</Description>
      ) : null}

      {onAction ? (
        <Action onClick={onAction}>
          Continue
        </Action>
      ) : null}
    </Root>
  );
}

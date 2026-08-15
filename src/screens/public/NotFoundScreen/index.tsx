'use client';

import { Action, Code, Description, Root, Title } from './elements';
import type { NotFoundScreenProps } from './interface';

export default function NotFoundScreen({
  title = 'We could not find that page.',
}: NotFoundScreenProps) {
  return (
    <Root aria-labelledby="not-found-title">
      <Code>404</Code>
      <Title id="not-found-title">{title}</Title>
      <Description>
        The product or page may have moved. Choose a storefront to continue
        browsing the current catalog.
      </Description>
      <Action href="/">Choose a storefront</Action>
    </Root>
  );
}

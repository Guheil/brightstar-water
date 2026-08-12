import { forwardRef } from 'react';
import { StyledAppLink } from './elements';
import type { AppLinkProps } from './interface';

const AppLink = forwardRef<HTMLAnchorElement, AppLinkProps>(
  function AppLink(props, ref) {
    return <StyledAppLink ref={ref} {...props} />;
  },
);

export default AppLink;

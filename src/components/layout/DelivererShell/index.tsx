import { History, Truck, UserRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  BottomNavigation,
  BottomNavLink,
  BrandLink,
  DesktopNavigation,
  DesktopNavLink,
  DesktopSidebar,
  Header,
  HeaderAction,
  HeaderInner,
  HeaderMeta,
  HeaderText,
  HeaderTitle,
  Main,
  MainContainer,
  ShellRoot,
  SidebarBody,
  SidebarUser,
  SkipLink,
  Workspace,
} from './elements';
import type {
  DelivererNavigationIcon,
  DelivererShellProps,
} from './interface';

const navigationIcons: Record<DelivererNavigationIcon, LucideIcon> = {
  active: Truck,
  history: History,
  profile: UserRound,
};

export default function DelivererShell({
  activeHref,
  brandName,
  children,
  className,
  headerAction,
  headerMeta,
  headerTitle,
  homeHref = '/deliverer/deliveries',
  mainId = 'deliverer-main-content',
  navigation,
  userName,
}: DelivererShellProps) {
  return (
    <ShellRoot className={className}>
      <SkipLink href={`#${mainId}`}>Skip to main content</SkipLink>

      <DesktopSidebar>
        <SidebarBody>
          <BrandLink href={homeHref}>{brandName}</BrandLink>
          <DesktopNavigation aria-label="Deliverer navigation">
            {navigation.map((item) => {
              const active = activeHref === item.href;
              const Icon = navigationIcons[item.icon];

              return (
                <DesktopNavLink
                  aria-current={active ? 'page' : undefined}
                  href={item.href}
                  key={item.href}
                  $active={active}
                >
                  <Icon aria-hidden="true" />
                  {item.label}
                </DesktopNavLink>
              );
            })}
          </DesktopNavigation>
          {userName ? <SidebarUser>{userName}</SidebarUser> : null}
        </SidebarBody>
      </DesktopSidebar>

      <Workspace>
        <Header>
          <HeaderInner>
            <HeaderText>
              <HeaderTitle>{headerTitle}</HeaderTitle>
              {headerMeta ? (
                <HeaderMeta>{headerMeta}</HeaderMeta>
              ) : null}
            </HeaderText>
            {headerAction ? <HeaderAction>{headerAction}</HeaderAction> : null}
          </HeaderInner>
        </Header>

        <Main id={mainId} tabIndex={-1}>
          <MainContainer>{children}</MainContainer>
        </Main>

        <BottomNavigation aria-label="Deliverer mobile navigation">
          {navigation.map((item) => {
            const active = activeHref === item.href;
            const Icon = navigationIcons[item.icon];

            return (
              <BottomNavLink
                aria-current={active ? 'page' : undefined}
                href={item.href}
                key={item.href}
                $active={active}
              >
                <Icon aria-hidden="true" />
                {item.label}
              </BottomNavLink>
            );
          })}
        </BottomNavigation>
      </Workspace>
    </ShellRoot>
  );
}

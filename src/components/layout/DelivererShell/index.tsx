'use client';

import { History, House, LogOut, Truck, UserRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LogoutConfirmDialog from '@/components/ui/LogoutConfirmDialog';
import { signOutCurrentUser } from '@/lib/auth/client';
import { useAppStore } from '@/store';
import {
  BottomNavigation,
  BottomNavLink,
  BrandLink,
  DesktopNavigation,
  DesktopNavLink,
  DesktopSidebar,
  Header,
  HeaderAction,
  HeaderControls,
  HeaderLogoutButton,
  HeaderLogoutLabel,
  HeaderInner,
  HeaderMeta,
  HeaderText,
  HeaderTitle,
  Main,
  MainContainer,
  ShellRoot,
  SidebarBody,
  SidebarFooter,
  SidebarLogoutButton,
  SidebarUser,
  SkipLink,
  Workspace,
} from './elements';
import type { DelivererNavigationIcon, DelivererShellProps } from './interface';

const navigationIcons: Record<DelivererNavigationIcon, LucideIcon> = {
  home: House,
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
  homeHref = '/deliverer',
  mainId = 'deliverer-main-content',
  navigation,
  userName,
}: DelivererShellProps) {
  const router = useRouter();
  const clearAuthSession = useAppStore((state) => state.commands.signOut);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const confirmLogout = async () => {
    setLogoutOpen(false);
    await signOutCurrentUser();
    clearAuthSession();
    router.replace('/login');
    router.refresh();
  };

  return (
    <>
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
          <SidebarFooter>
            {userName ? <SidebarUser>{userName}</SidebarUser> : null}
            <SidebarLogoutButton
              onClick={() => setLogoutOpen(true)}
              startIcon={<LogOut aria-hidden="true" />}
              variant="outlined"
            >
              Log out
            </SidebarLogoutButton>
          </SidebarFooter>
        </SidebarBody>
      </DesktopSidebar>

      <Workspace>
        <Header>
          <HeaderInner>
            <HeaderText>
              <HeaderTitle>{headerTitle}</HeaderTitle>
              {headerMeta ? <HeaderMeta>{headerMeta}</HeaderMeta> : null}
            </HeaderText>
            <HeaderControls>
              {headerAction ? <HeaderAction>{headerAction}</HeaderAction> : null}
              <HeaderLogoutButton
                aria-label="Log out"
                onClick={() => setLogoutOpen(true)}
                startIcon={<LogOut aria-hidden="true" />}
              >
                <HeaderLogoutLabel>Log out</HeaderLogoutLabel>
              </HeaderLogoutButton>
            </HeaderControls>
          </HeaderInner>
        </Header>
        <Main id={mainId} tabIndex={-1}>
          <MainContainer>{children}</MainContainer>
        </Main>
      </Workspace>

      <BottomNavigation aria-label="Deliverer navigation">
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
    </ShellRoot>
      <LogoutConfirmDialog
        description="You’ll need to sign in again to view or update assigned deliveries."
        onClose={() => setLogoutOpen(false)}
        onConfirm={confirmLogout}
        open={logoutOpen}
        title="Log out of Deliverer?"
      />
    </>
  );
}

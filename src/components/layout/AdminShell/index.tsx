'use client';

import { useState } from 'react';
import {
  Boxes,
  ClipboardList,
  Gift,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Truck,
  Users,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  BrandLink,
  BrandName,
  BrandSubtitle,
  CloseButton,
  DesktopSidebar,
  HeaderActions,
  HeaderLabel,
  Main,
  MainContainer,
  MenuButton,
  MobileDrawer,
  ShellRoot,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarNavigation,
  SidebarNavLink,
  SignOutButton,
  SkipLink,
  UserName,
  UserRole,
  Workspace,
  WorkspaceHeader,
} from './elements';
import type {
  AdminNavigationIcon,
  AdminNavigationItem,
  AdminShellProps,
} from './interface';

const navigationIcons: Record<AdminNavigationIcon, LucideIcon> = {
  overview: LayoutDashboard,
  orders: ClipboardList,
  deliveries: Truck,
  inventory: Boxes,
  products: Package,
  customers: Users,
  loyalty: Gift,
};

interface NavigationProps {
  activeHref?: string;
  items: readonly AdminNavigationItem[];
  onNavigate?: () => void;
}

function AdminNavigation({ activeHref, items, onNavigate }: NavigationProps) {
  return (
    <SidebarNavigation aria-label="Admin navigation">
      {items.map((item) => {
        const active = activeHref === item.href;
        const Icon = navigationIcons[item.icon];

        return (
          <SidebarNavLink
            aria-current={active ? 'page' : undefined}
            href={item.href}
            key={item.href}
            onClick={onNavigate}
            $active={active}
          >
            <Icon aria-hidden="true" />
            {item.label}
          </SidebarNavLink>
        );
      })}
    </SidebarNavigation>
  );
}

export default function AdminShell({
  activeHref,
  brandName,
  brandSubtitle,
  children,
  className,
  headerActions,
  headerLabel = 'Operations',
  homeHref = '/admin/overview',
  mainId = 'admin-main-content',
  navigation,
  onSignOut,
  signOutLabel = 'Sign out',
  userName,
  userRole = 'Administrator',
}: AdminShellProps) {
  const [navigationOpen, setNavigationOpen] = useState(false);

  const sidebarContent = (mobile = false) => (
    <SidebarBody>
      <SidebarHeader>
        <BrandLink
          href={homeHref}
          onClick={mobile ? () => setNavigationOpen(false) : undefined}
        >
          <BrandName>{brandName}</BrandName>
          {brandSubtitle ? (
            <BrandSubtitle>{brandSubtitle}</BrandSubtitle>
          ) : null}
        </BrandLink>
        {mobile ? (
          <CloseButton
            aria-label="Close admin navigation"
            onClick={() => setNavigationOpen(false)}
          >
            <X aria-hidden="true" />
          </CloseButton>
        ) : null}
      </SidebarHeader>

      <AdminNavigation
        activeHref={activeHref}
        items={navigation}
        onNavigate={mobile ? () => setNavigationOpen(false) : undefined}
      />

      <SidebarFooter>
        <div>
          <UserName>{userName}</UserName>
          <UserRole>{userRole}</UserRole>
        </div>
        {onSignOut ? (
          <SignOutButton
            onClick={onSignOut}
            startIcon={<LogOut aria-hidden="true" />}
          >
            {signOutLabel}
          </SignOutButton>
        ) : null}
      </SidebarFooter>
    </SidebarBody>
  );

  return (
    <ShellRoot className={className}>
      <SkipLink href={`#${mainId}`}>Skip to main content</SkipLink>

      <DesktopSidebar>{sidebarContent()}</DesktopSidebar>

      <MobileDrawer
        anchor="left"
        onClose={() => setNavigationOpen(false)}
        open={navigationOpen}
      >
        {sidebarContent(true)}
      </MobileDrawer>

      <Workspace>
        <WorkspaceHeader>
          <MenuButton
            aria-expanded={navigationOpen}
            aria-label="Open admin navigation"
            onClick={() => setNavigationOpen(true)}
          >
            <Menu aria-hidden="true" />
          </MenuButton>
          <HeaderLabel>{headerLabel}</HeaderLabel>
          {headerActions ? (
            <HeaderActions>{headerActions}</HeaderActions>
          ) : null}
        </WorkspaceHeader>

        <Main id={mainId} tabIndex={-1}>
          <MainContainer>{children}</MainContainer>
        </Main>
      </Workspace>
    </ShellRoot>
  );
}

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

const dialogSource = read('src/components/ui/LogoutConfirmDialog/index.tsx');
const customerHeaderSource = read('src/components/layout/CustomerHeader/index.tsx');
const adminShellSource = read('src/components/layout/AdminShell/index.tsx');
const delivererShellSource = read('src/components/layout/DelivererShell/index.tsx');
const delivererProfileSource = read('src/screens/deliverer/ProfileScreen/index.tsx');
const delivererHomeElements = read('src/screens/deliverer/DelivererHomeScreen/elements.tsx');

describe('logout confirmation contract', () => {
  it('keeps cancel as the safe initial dialog action', () => {
    expect(dialogSource).toContain('<CancelButton autoFocus');
    expect(dialogSource).toContain("confirmLabel = 'Log out'");
  });

  it('confirms customer logout before calling the supplied logout command', () => {
    expect(customerHeaderSource).toContain('setLogoutOpen(true)');
    expect(customerHeaderSource).toContain('<LogoutConfirmDialog');
    expect(customerHeaderSource).toContain('onLogout?.()');
  });

  it('confirms admin logout before ending the operations session', () => {
    expect(adminShellSource).toContain('title="Log out of Admin?"');
    expect(adminShellSource).toContain('setLogoutOpen(true)');
    expect(adminShellSource).toContain('onSignOut();');
  });

  it('provides global and profile-level deliverer logout confirmation', () => {
    expect(delivererShellSource).toContain('title="Log out of Deliverer?"');
    expect(delivererShellSource).toContain('<SidebarLogoutButton');
    expect(delivererShellSource).toContain('<HeaderLogoutButton');
    expect(delivererProfileSource).toContain('<LogoutConfirmDialog');
  });

  it('adds breathing room inside the next-delivery content area', () => {
    expect(delivererHomeElements).toContain('padding: theme.spacing(3)');
    expect(delivererHomeElements).not.toContain("padding: theme.spacing(3, 0)");
  });
});

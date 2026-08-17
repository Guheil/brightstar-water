import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');

const shell = read('src/components/layout/AdminShell/elements.tsx');
const shellIndex = read('src/components/layout/AdminShell/index.tsx');
const routeShell = read('src/screens/admin/AdminRouteShell/index.tsx');
const dataTable = read('src/screens/admin/components/AdminDataTable/elements.tsx');
const pageHeader = read('src/screens/admin/components/AdminPageHeader/elements.tsx');
const metricStrip = read('src/screens/admin/components/AdminMetricStrip/elements.tsx');

const pageSources = [
  'OrdersScreen',
  'DeliveriesScreen',
  'InventoryScreen',
  'ProductsScreen',
  'CustomersScreen',
  'AccountsScreen',
  'LoyaltyScreen',
].map((name) => read(`src/screens/admin/${name}/index.tsx`));

describe('calm operations workspace redesign', () => {
  it('keeps the admin sidebar fixed and the desktop workspace independently scrollable', () => {
    expect(shell).toContain("position: 'fixed'");
    expect(shell).toContain('marginInlineStart: theme.spacing(34)');
    expect(shell).toContain("overflowY: 'auto'");
  });

  it('renders every admin navigation item with a valid icon mapping', () => {
    expect(routeShell).toContain("icon: 'accounts'");
    expect(shellIndex).toContain('accounts: UserPlus');
    expect(shellIndex).toContain('navigationIcons[item.icon] ?? Users');
    expect(shellIndex).not.toContain('UserCog');
  });

  it('uses a restrained persistent workspace header instead of decorative brand marks', () => {
    expect(routeShell).toContain('headerLabel="Operations workspace"');
    expect(shellIndex).not.toContain('HeaderBrandMark');
    expect(shellIndex).not.toContain('BrandSignal');
    expect(shell).not.toContain('&::before');
    expect(shell).not.toContain('&::after');
  });

  it('keeps page hierarchy and data surfaces flat and readable', () => {
    pageSources.forEach((source) => expect(source).toContain('<AdminMetricStrip'));
    expect(dataTable).toContain('theme.vars.palette.primary.main');
    expect(dataTable).not.toContain('&::before');
    expect(dataTable).not.toContain('&::after');
    expect(pageHeader).not.toContain('boxShadow');
    expect(pageHeader).not.toContain('&::before');
    expect(metricStrip).not.toContain('data-tone');
  });
});

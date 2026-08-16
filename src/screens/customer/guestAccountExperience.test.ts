import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

const publicShell = read('src/screens/public/PublicShell/index.tsx');
const brandShell = read('src/screens/public/BrandPublicShell/index.tsx');
const customerShell = read('src/screens/customer/_shared/CustomerAreaShell/index.tsx');
const customerHeader = read('src/components/layout/CustomerHeader/index.tsx');

describe('customer header authentication state', () => {
  it('shows Sign In instead of Account to signed-out storefront visitors', () => {
    expect(publicShell).toContain("accountLabel={canLogout ? 'Account' : 'Sign In'}");
    expect(brandShell).toContain("accountLabel={canLogout ? 'Account' : 'Sign In'}");
    expect(publicShell).toContain("`/login?next=${encodeURIComponent(pathname)}`");
    expect(brandShell).toContain("`/login?next=${encodeURIComponent(pathname)}`");
  });

  it('keeps Account for authenticated customers', () => {
    expect(customerShell).toContain("accountLabel={isCustomer ? 'Account' : 'Sign In'}");
    expect(customerShell).toContain("accountHref={isCustomer ? '/customer/account'");
  });

  it('keeps the protected-action dialog separate from the header sign-in link', () => {
    expect(customerShell).toContain('purpose="protected"');
    expect(customerShell).toContain('open={!isCustomer && !accountRoute}');
    expect(customerShell).toContain("router.replace(`/login?next=${encodeURIComponent('/customer/account')}`)");
    expect(customerShell).not.toContain('GuestAccountScreen');
    expect(customerHeader).toContain('<ActionText>{accountLabel}</ActionText>');
  });

  it('hides cart and order navigation from signed-out storefront visitors', () => {
    expect(publicShell).toContain('showOrderNavigation={canLogout}');
    expect(brandShell).toContain('showOrderNavigation={canLogout}');
    expect(customerHeader).toContain('showOrderNavigation = true');
    expect(customerHeader).toContain("'/customer/cart'");
    expect(customerHeader).toContain("'/customer/orders'");
    expect(customerHeader).toContain('{showOrderNavigation ? (');
    expect(customerHeader).toContain('visibleNavigation.map');
    expect(customerHeader).toContain('visibleMegaMenuGroups.map');
  });
});

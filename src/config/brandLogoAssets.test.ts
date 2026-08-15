import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SHARED_STOREFRONT_LOGO_SOURCES, STOREFRONT_BRANDS } from './brands';

const readSource = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), 'utf8');

describe('storefront logo contract', () => {
  it('maps each storefront to its own distinguishable rectangular logo asset', () => {
    expect(STOREFRONT_BRANDS.mrje.logoSrc).toBe('/brand/mrje-gas-logo.png');
    expect(STOREFRONT_BRANDS.brightstar.logoSrc).toBe('/brand/brightstar-water-logo.png');
  });

  it('uses both PNG storefront marks in shared headers', () => {
    expect(SHARED_STOREFRONT_LOGO_SOURCES).toEqual([
      '/brand/mrje-gas-logo.png',
      '/brand/brightstar-water-logo.png',
    ]);

    const publicShellSource = readSource('src/screens/public/PublicShell/index.tsx');
    const customerShellSource = readSource(
      'src/screens/customer/_shared/CustomerAreaShell/index.tsx',
    );
    expect(publicShellSource).toContain(
      'logoSources={SHARED_STOREFRONT_LOGO_SOURCES}',
    );
    expect(customerShellSource).toContain(
      'logoSources={SHARED_STOREFRONT_LOGO_SOURCES}',
    );
  });

  it('renders brand artwork instead of the old textual storefront wordmark', () => {
    const source = readSource('src/screens/public/BrandPublicShell/index.tsx');
    expect(source).toContain('logoSrc={brand.logoSrc}');
    expect(source).not.toContain('wordmark={brand.brandName}');
  });

  it('keeps transparent-header inversion scoped to the image artwork', () => {
    const source = readSource('src/components/layout/CustomerHeader/elements.tsx');
    expect(source).toContain("filter: $inverted ? 'grayscale(1) brightness(0) invert(1)' : 'none'");
  });
});

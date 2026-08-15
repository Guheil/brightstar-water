import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), 'utf8');

const rootLayout = readSource('src/app/layout.tsx');
const brightStarElements = readSource('src/screens/public/BrightStarHomeScreen/elements.tsx');
const mrjeElements = readSource('src/screens/public/MrjeHomeScreen/elements.tsx');

describe('hydration and storefront layout hardening', () => {
  it('suppresses unavoidable body-level hydration noise from browser-injected attributes', () => {
    expect(rootLayout).toContain('<body suppressHydrationWarning>');
  });

  it('keeps both storefront hero sections at least one viewport tall', () => {
    expect(brightStarElements).toContain("minHeight: '100vh'");
    expect(mrjeElements).toContain("minHeight: '100vh'");
  });

  it('stretches the Bright Star process photograph to the height of its content column', () => {
    expect(brightStarElements).toContain("alignItems: 'stretch'");
    expect(brightStarElements).toContain("height: '100%'");
    expect(brightStarElements).toContain("gridTemplateColumns: 'minmax(10rem, 0.38fr) minmax(0, 0.62fr)'");
  });
});

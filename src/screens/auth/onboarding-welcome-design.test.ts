import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relativePath: string) =>
  readFileSync(join(process.cwd(), relativePath), 'utf8');

const screenSource = read('src/screens/auth/OnboardingScreen/index.tsx');
const screenElements = read('src/screens/auth/OnboardingScreen/elements.tsx');

describe('welcoming onboarding design', () => {
  it('uses the real MRJE and Bright Star logo artwork dedicated to onboarding', () => {
    expect(screenSource).toContain('src="/onboarding/mrje-gas-logo.png"');
    expect(screenSource).toContain('src="/onboarding/bright-star-water-logo.png"');
    expect(existsSync(join(process.cwd(), 'public/onboarding/mrje-gas-logo.png'))).toBe(true);
    expect(existsSync(join(process.cwd(), 'public/onboarding/bright-star-water-logo.png'))).toBe(true);
  });

  it('welcomes the user with real storefront delivery imagery instead of cloning the login scaffold', () => {
    expect(screenSource).toContain('STOREFRONT_MEDIA.gas.delivery');
    expect(screenSource).toContain('STOREFRONT_MEDIA.water.delivery');
    expect(screenSource).toContain('<WelcomeBand>');
    expect(screenSource).toContain('<SetupWorkspace>');
    expect(screenSource).not.toContain('<AuthScaffold');
  });

  it('keeps visual styling isolated and theme-driven', () => {
    expect(screenSource).not.toContain('sx=');
    expect(screenSource).not.toContain('style=');
    expect(screenSource).not.toContain('styled(');
    expect(screenElements).toContain('theme.layout.maxContentWidth');
    expect(screenElements).toContain("theme.vars.palette.background.default");
    expect(screenElements).not.toContain('linear-gradient');
    expect(screenElements).not.toMatch(/#[0-9A-Fa-f]{3,8}/);
  });

  it('retains responsive structural changes for tablet and phone layouts', () => {
    expect(screenElements).toContain("[theme.breakpoints.down('md')]");
    expect(screenElements).toContain("[theme.breakpoints.down('sm')]");
    expect(screenElements).toContain("gridTemplateColumns: '1fr'");
  });
});

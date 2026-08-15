import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), 'utf8');

const brightStarSource = readSource('src/screens/public/BrightStarHomeScreen/index.tsx');
const brightStarElements = readSource('src/screens/public/BrightStarHomeScreen/elements.tsx');
const mrjeSource = readSource('src/screens/public/MrjeHomeScreen/index.tsx');
const mrjeElements = readSource('src/screens/public/MrjeHomeScreen/elements.tsx');

describe('storefront closing CTA design', () => {
  it('uses an image-led overlapping Bright Star CTA with a single dominant shop action', () => {
    expect(brightStarSource).toContain('data-water-closing-stage');
    expect(brightStarSource).toContain('data-water-closing-media');
    expect(brightStarSource).toContain('data-water-closing-panel');
    expect(brightStarSource).toContain('STOREFRONT_MEDIA.water.delivery');
    expect(brightStarSource).toContain('Shop Bright Star Water');
    expect(brightStarSource).not.toContain('ClosingKicker');
    expect(brightStarElements).toContain('gridColumn: \'7 / -1\'');
    expect(brightStarElements).toContain('backgroundColor: theme.vars.palette.water.main');
  });

  it('uses a distinct industrial MRJE CTA rather than recoloring the Bright Star composition', () => {
    expect(mrjeSource).toContain('data-gas-closing-stage');
    expect(mrjeSource).toContain('data-gas-closing-media');
    expect(mrjeSource).toContain('data-gas-closing-panel');
    expect(mrjeSource).toContain('Shop MRJE Gas');
    expect(mrjeSource).not.toContain('ClosingKicker');
    expect(mrjeElements).toContain("clipPath: 'polygon(8% 0, 100% 0, 100% 100%, 0 100%)'");
    expect(mrjeElements).toContain('backgroundColor: theme.vars.palette.gas.main');
  });

  it('keeps reduced-motion users out of the entrance animation path', () => {
    expect(brightStarSource).toContain('(prefers-reduced-motion: no-preference)');
    expect(mrjeSource).toContain('(prefers-reduced-motion: no-preference)');
    expect(brightStarSource).toContain("typeof IntersectionObserver === 'undefined'");
    expect(mrjeSource).toContain("typeof IntersectionObserver === 'undefined'");
  });
});

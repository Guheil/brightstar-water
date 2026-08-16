import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');
const shell = read('src/components/layout/DelivererShell/elements.tsx');
const shellIndex = read('src/components/layout/DelivererShell/index.tsx');
const nav = read('src/screens/deliverer/_shared/delivererNavigation.ts');
const home = read('src/screens/deliverer/DelivererHomeScreen/index.tsx');
const homeElements = read('src/screens/deliverer/DelivererHomeScreen/elements.tsx');
const detail = read('src/screens/deliverer/DeliveryDetailScreen/index.tsx');
const detailElements = read('src/screens/deliverer/DeliveryDetailScreen/elements.tsx');

describe('mobile-first deliverer workspace', () => {
  it('provides four thumb-friendly bottom destinations without a decorative active line', () => {
    expect(nav).toContain("label: 'Home'");
    expect(nav).toContain("label: 'Deliveries'");
    expect(nav).toContain("label: 'History'");
    expect(nav).toContain("label: 'Profile'");
    expect(shell).toContain("position: 'fixed'");
    expect(shell).toContain('BottomNavigation');
    expect(shell).not.toContain('&::before');
    expect(shellIndex).not.toContain('BrandSignal');
  });

  it('centers the home experience on the next stop and limits entrance animation to the next task', () => {
    expect(home).toContain('Next delivery');
    expect(home).toContain('COD in queue');
    expect(home).toContain('useGSAP');
    expect(home).toContain('(prefers-reduced-motion: no-preference)');
    expect(home).toContain("gsap.from('[data-field-next]'");
    expect(homeElements).not.toContain('&::before');
    expect(homeElements).not.toContain('&::after');
  });

  it('keeps field utilities and completion evidence while flattening decorative surfaces', () => {
    expect(detail).toContain('Call customer');
    expect(detail).toContain('Directions');
    expect(detail).toContain('Copy address');
    expect(detail).toContain('recordDeliveryCompletion');
    expect(detail).toContain('completeDelivery');
    expect(detail).toContain('Add delivery photo');
    expect(detailElements).not.toContain('&::before');
    expect(detailElements).not.toContain('linear-gradient');
  });
});

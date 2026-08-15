import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { STOREFRONT_MEDIA } from '@/config/storefrontMedia';

const readSource = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), 'utf8');

const mrjeSource = readSource('src/screens/public/MrjeHomeScreen/index.tsx');
const brightStarSource = readSource('src/screens/public/BrightStarHomeScreen/index.tsx');
const deliverySource = readSource('src/screens/public/DeliveryInfoScreen/index.tsx');
const publicShellSource = readSource('src/screens/public/PublicShell/index.tsx');

describe('expanded public storefront content', () => {
  it('keeps at least five additional meaningful MRJE sections beyond hero, products, and story', () => {
    const sectionIds = [
      'mrje-ordering-title',
      'mrje-delivery-title',
      'mrje-payment-title',
      'mrje-account-title',
      'mrje-loyalty-title',
      'mrje-closing-title',
    ];

    sectionIds.forEach((id) => expect(mrjeSource).toContain(id));
  });

  it('keeps at least five additional meaningful Bright Star sections beyond hero and products', () => {
    const sectionIds = [
      'brightstar-process-title',
      'brightstar-routine-title',
      'brightstar-delivery-title',
      'brightstar-payment-title',
      'brightstar-account-title',
      'brightstar-loyalty-title',
      'brightstar-closing-title',
    ];

    sectionIds.forEach((id) => expect(brightStarSource).toContain(id));
  });

  it('keeps the delivery page image-led and gives platform users both storefront choices', () => {
    expect(deliverySource).toContain('HeroMedia');
    expect(deliverySource).toContain('JourneyMedia');
    expect(deliverySource).toContain('href="/mrje/shop"');
    expect(deliverySource).toContain('href="/brightstar/shop"');
  });

  it('uses the paired storefront PNG logos on generic public pages', () => {
    expect(publicShellSource).toContain(
      'logoSources={SHARED_STOREFRONT_LOGO_SOURCES}',
    );
    expect(publicShellSource).not.toContain('wordmark="MRJE + BRIGHT STAR"');
  });

  it('provides real-world delivery photography for both storefronts', () => {
    expect(STOREFRONT_MEDIA.gas.delivery.src).toMatch(/^https:\/\//);
    expect(STOREFRONT_MEDIA.water.delivery.src).toMatch(/^https:\/\//);
    expect(STOREFRONT_MEDIA.gas.delivery.alt.length).toBeGreaterThan(20);
    expect(STOREFRONT_MEDIA.water.delivery.alt.length).toBeGreaterThan(20);
  });
});

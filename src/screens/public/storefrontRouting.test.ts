import { describe, expect, it } from 'vitest';
import {
  getBrandFromPathname,
  getProductStorefrontPath,
  STOREFRONT_BRANDS,
} from '@/config';
import { PRODUCT_DATA } from '@/data';

describe('public storefront routing', () => {
  it('resolves only explicit MRJE and Bright Star route segments', () => {
    expect(getBrandFromPathname('/mrje')?.key).toBe('mrje');
    expect(getBrandFromPathname('/mrje/shop')?.key).toBe('mrje');
    expect(getBrandFromPathname('/brightstar')?.key).toBe('brightstar');
    expect(getBrandFromPathname('/brightstar/product/example')?.key).toBe(
      'brightstar',
    );
    expect(getBrandFromPathname('/mrje-fake')).toBeNull();
    expect(getBrandFromPathname('/customer/orders')).toBeNull();
  });

  it('keeps every catalog product in the correct storefront', () => {
    for (const product of PRODUCT_DATA) {
      const path = getProductStorefrontPath(product.category, product.id);
      const expectedPrefix =
        product.category === 'gas'
          ? STOREFRONT_BRANDS.mrje.productHrefPrefix
          : STOREFRONT_BRANDS.brightstar.productHrefPrefix;

      expect(path.startsWith(`${expectedPrefix}/`)).toBe(true);
    }
  });

  it('encodes product ids before they become route segments', () => {
    expect(getProductStorefrontPath('gas', 'unsafe id/with slash')).toBe(
      '/mrje/product/unsafe%20id%2Fwith%20slash',
    );
  });

  it('keeps brand shop routes category-specific', () => {
    expect(STOREFRONT_BRANDS.mrje.productCategory).toBe('gas');
    expect(STOREFRONT_BRANDS.brightstar.productCategory).toBe('water');
    expect(STOREFRONT_BRANDS.mrje.shopHref).not.toBe(
      STOREFRONT_BRANDS.brightstar.shopHref,
    );
  });
});

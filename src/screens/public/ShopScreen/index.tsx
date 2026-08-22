'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { STOREFRONT_MEDIA } from '@/config';
import AddToCartConfirmDialog from '@/components/ui/AddToCartConfirmDialog';
import CartAddedToast from '@/components/ui/CartAddedToast';
import EmptyState from '@/components/ui/EmptyState';
import Notice from '@/components/ui/Notice';
import AuthRequiredDialog from '@/screens/public/AuthRequiredDialog';
import { useAppStore } from '@/store';
import { formatPhp } from '@/utils';
import type { ProductUnit } from '@/types';
import type {
  ShopCategoryFilter,
  ShopProductView,
  ShopScreenProps,
  ShopSort,
} from './interface';
import {
  AddButton,
  CategoryButton,
  CategoryControls,
  CategoryLine,
  ClearSearchButton,
  Container,
  CoverageLink,
  EmptyPanel,
  Intro,
  Introduction,
  ProductArticle,
  ProductAvailability,
  ProductContent,
  ProductDescription,
  ProductGrid,
  ProductImage,
  ProductLink,
  ProductMedia,
  ProductName,
  ProductPrice,
  ResetButton,
  ResultsBar,
  ResultsCount,
  Root,
  SearchAdornment,
  SearchField,
  SortControl,
  SortLabel,
  SortOption,
  SortSelect,
  StoreVisual,
  StoreVisualImage,
  Title,
  ToolBar,
} from './elements';

const accessoryUnits: ProductUnit[] = ['piece', 'container'];

const categoryOptions: Array<{
  label: string;
  value: ShopCategoryFilter;
  tone: 'neutral' | 'gas' | 'water';
}> = [
  { label: 'All products', value: 'all', tone: 'neutral' },
  { label: 'Gas', value: 'gas', tone: 'gas' },
  { label: 'Water', value: 'water', tone: 'water' },
  { label: 'Accessories', value: 'accessories', tone: 'neutral' },
];

function normalizeCategory(value?: string): ShopCategoryFilter {
  return ['gas', 'water', 'accessories'].includes(value ?? '')
    ? (value as ShopCategoryFilter)
    : 'all';
}

export default function ShopScreen({
  coverageHref = '/about-delivery',
  initialCategory,
  initialQuery = '',
  introduction = 'Browse LPG refills, purified water, and practical accessories. Current availability is shown for every product.',
  lockedCategory,
  productHrefPrefix = '/product',
  title = 'Shop household essentials',
}: ShopScreenProps) {
  const pathname = usePathname();
  const session = useAppStore((state) => state.auth.session);
  const isCustomer = session?.user.role === 'customer' && Boolean(session.user.customerId);
  const products = useAppStore((state) => state.catalog.products);
  const catalogInitialized = useAppStore((state) => state.catalog.initialized);
  const catalogError = useAppStore((state) => state.catalog.error);
  const inventory = useAppStore((state) => state.inventory.items);
  const cartItems = useAppStore((state) => state.cart.items);
  const cartReady = useAppStore((state) => state.cart.initialized && Boolean(state.cart.ownerCustomerId));
  const addCartItem = useAppStore((state) => state.commands.addCartItem);
  const [category, setCategory] = useState<ShopCategoryFilter>(() =>
    normalizeCategory(initialCategory),
  );
  const [query, setQuery] = useState(initialQuery);
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase());
  const [sort, setSort] = useState<ShopSort>('featured');
  const [pendingCart, setPendingCart] = useState<{
    product: ShopProductView;
    quantity: number;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastSequence, setToastSequence] = useState(0);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const storefrontImage =
    lockedCategory === 'water'
      ? STOREFRONT_MEDIA.water.refillStation
      : lockedCategory === 'gas'
        ? STOREFRONT_MEDIA.gas.hero
        : null;

  const productViews = useMemo<ShopProductView[]>(
    () =>
      products.map((product) => {
        const stock = inventory.find((item) => item.productId === product.id);
        const availableStock = Math.max(
          0,
          (stock?.stockOnHand ?? 0) - (stock?.stockReserved ?? 0),
        );

        const currentCartQuantity =
          cartItems.find((item) => item.productId === product.id)?.quantity ?? 0;

        return {
          ...product,
          availableStock,
          maxAddableQuantity: Math.max(0, availableStock - currentCartQuantity),
          isAvailable: product.isActive && availableStock > 0,
        };
      }),
    [cartItems, inventory, products],
  );

  const visibleProducts = useMemo(() => {
    const filtered = productViews.filter((product) => {
      const matchesStorefront =
        !lockedCategory || product.category === lockedCategory;
      const matchesCategory =
        category === 'all' ||
        (!lockedCategory && product.category === category) ||
        (category === 'accessories' && accessoryUnits.includes(product.unit as ProductUnit));
      const searchableText = `${product.name} ${product.shortDescription} ${product.category}`.toLocaleLowerCase();
      return (
        matchesStorefront &&
        matchesCategory &&
        searchableText.includes(deferredQuery)
      );
    });

    return [...filtered].sort((left, right) => {
      if (sort === 'price-low') return left.priceCentavos - right.priceCentavos;
      if (sort === 'price-high') return right.priceCentavos - left.priceCentavos;
      if (sort === 'name') return left.name.localeCompare(right.name);
      const leftProduct = products.find((product) => product.id === left.id);
      const rightProduct = products.find((product) => product.id === right.id);
      return Number(Boolean(rightProduct?.isFeatured)) - Number(Boolean(leftProduct?.isFeatured));
    });
  }, [category, deferredQuery, lockedCategory, productViews, products, sort]);

  const visibleCategoryOptions = lockedCategory
    ? [
        {
          label: lockedCategory === 'gas' ? 'All gas products' : 'All water products',
          value: 'all' as ShopCategoryFilter,
          tone: lockedCategory,
        },
        {
          label: 'Accessories',
          value: 'accessories' as ShopCategoryFilter,
          tone: 'neutral' as const,
        },
      ]
    : categoryOptions;

  const resetFilters = () => {
    setCategory('all');
    setQuery('');
    setSort('featured');
  };

  return (
    <Root>
      <Container>
        <Intro>
          <div>
            <Title>{title}</Title>
            <Introduction>{introduction}</Introduction>
          </div>
          <CoverageLink href={coverageHref}>
            Check delivery coverage and fees
          </CoverageLink>
        </Intro>

        {storefrontImage ? (
          <StoreVisual>
            <StoreVisualImage
              alt={storefrontImage.alt}
              fill
              priority
              sizes="(max-width: 1440px) 100vw, 1440px"
              src={storefrontImage.src}
            />
          </StoreVisual>
        ) : null}

        <ToolBar role="search" aria-label="Search and sort products">
          <SearchField
            fullWidth
            label="Search products"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={
              lockedCategory === 'gas'
                ? 'Try LPG or regulator'
                : lockedCategory === 'water'
                  ? 'Try refill or container'
                  : 'Try LPG, water, or regulator'
            }
            type="search"
            value={query}
            slotProps={{
              input: {
                startAdornment: (
                  <SearchAdornment position="start">
                    <Search aria-hidden="true" />
                  </SearchAdornment>
                ),
                endAdornment: query ? (
                  <SearchAdornment position="end">
                    <ClearSearchButton
                      aria-label="Clear product search"
                      onClick={() => setQuery('')}
                    >
                      <X aria-hidden="true" />
                    </ClearSearchButton>
                  </SearchAdornment>
                ) : null,
              },
            }}
          />
          <SortControl fullWidth>
            <SortLabel id="shop-sort-label">Sort products</SortLabel>
            <SortSelect
              label="Sort products"
              labelId="shop-sort-label"
              onChange={(event) => setSort(event.target.value as ShopSort)}
              value={sort}
            >
              <SortOption value="featured">Featured first</SortOption>
              <SortOption value="price-low">Price: low to high</SortOption>
              <SortOption value="price-high">Price: high to low</SortOption>
              <SortOption value="name">Name</SortOption>
            </SortSelect>
          </SortControl>
        </ToolBar>

        <CategoryControls aria-label="Product categories" role="group">
          {visibleCategoryOptions.map((option) => (
            <CategoryButton
              aria-pressed={category === option.value}
              key={option.value}
              onClick={() => setCategory(option.value)}
              variant="outlined"
              $selected={category === option.value}
              $tone={option.tone}
            >
              {option.label}
            </CategoryButton>
          ))}
        </CategoryControls>

        {!catalogInitialized ? (
          <Notice title="Loading products">Current products and inventory are being loaded from the database.</Notice>
        ) : catalogError ? (
          <Notice title="Catalog unavailable" tone="error">{catalogError}</Notice>
        ) : null}

        <ResultsBar aria-live="polite">
          <ResultsCount>
            {visibleProducts.length}{' '}
            {visibleProducts.length === 1 ? 'product' : 'products'} found
          </ResultsCount>
          <ResultsCount>Current inventory</ResultsCount>
        </ResultsBar>

        {!catalogInitialized ? null : visibleProducts.length ? (
          <ProductGrid>
            {visibleProducts.map((product, index) => (
              <ProductArticle
                aria-labelledby={`shop-product-${product.id}`}
                key={product.id}
              >
                <ProductLink href={`${productHrefPrefix}/${product.id}`}>
                  <ProductMedia>
                    <ProductImage
                      alt={product.imageAlt}
                      fill
                      loading={index === 0 ? 'eager' : 'lazy'}
                      sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                      src={product.imageSrc}
                    />
                  </ProductMedia>
                </ProductLink>
                <ProductContent>
                  <CategoryLine $tone={product.category}>
                    {product.category} · {product.unit}
                  </CategoryLine>
                  <ProductLink href={`${productHrefPrefix}/${product.id}`}>
                    <ProductName id={`shop-product-${product.id}`}>
                      {product.name}
                    </ProductName>
                  </ProductLink>
                  <ProductDescription>{product.shortDescription}</ProductDescription>
                  <ProductPrice>{formatPhp(product.priceCentavos)}</ProductPrice>
                  <ProductAvailability $available={product.isAvailable}>
                    {product.isAvailable
                      ? `${product.availableStock} available`
                      : 'Currently unavailable'}
                  </ProductAvailability>
                  <AddButton
                    disabled={!product.isAvailable || product.maxAddableQuantity <= 0 || (isCustomer && !cartReady)}
                    onClick={() => {
                      if (!isCustomer) {
                        setAuthPromptOpen(true);
                        return;
                      }
                      setPendingCart({ product, quantity: 1 });
                    }}
                    variant="contained"
                  >
                    Add to cart
                  </AddButton>
                </ProductContent>
              </ProductArticle>
            ))}
          </ProductGrid>
        ) : (
          <EmptyPanel>
            <EmptyState
              action={
                <ResetButton onClick={resetFilters} variant="outlined">
                  Show all products
                </ResetButton>
              }
              description="Try a different product name or clear the selected category."
              title="No products match these filters"
            />
          </EmptyPanel>
        )}
      </Container>
      <AddToCartConfirmDialog
        maxQuantity={pendingCart?.product.maxAddableQuantity ?? 1}
        onClose={() => setPendingCart(null)}
        onConfirm={() => {
          const selection = pendingCart;
          setPendingCart(null);
          if (!selection) return;

          const result = addCartItem(selection.product.id, selection.quantity);
          if (!result.ok) return;

          setToastMessage(
            selection.quantity === 1
              ? `${selection.product.name} added to your cart.`
              : `${selection.quantity} × ${selection.product.name} added to your cart.`,
          );
          setToastSequence((current) => current + 1);
        }}
        onQuantityChange={(nextQuantity) =>
          setPendingCart((current) =>
            current ? { ...current, quantity: nextQuantity } : current,
          )
        }
        open={Boolean(pendingCart)}
        productName={pendingCart?.product.name ?? ''}
        quantity={pendingCart?.quantity ?? 1}
        subtotalLabel={formatPhp(
          (pendingCart?.product.priceCentavos ?? 0) * (pendingCart?.quantity ?? 1),
        )}
      />
      <CartAddedToast
        key={toastSequence}
        message={toastMessage ?? ''}
        onClose={() => setToastMessage(null)}
        open={Boolean(toastMessage)}
      />
      <AuthRequiredDialog
        nextPath={pathname}
        onClose={() => setAuthPromptOpen(false)}
        open={authPromptOpen}
      />
    </Root>
  );
}

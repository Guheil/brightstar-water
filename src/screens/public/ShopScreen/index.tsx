'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
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
  Feedback,
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
  initialCategory,
  initialQuery = '',
}: ShopScreenProps) {
  const products = useAppStore((state) => state.catalog.products);
  const inventory = useAppStore((state) => state.inventory.items);
  const addCartItem = useAppStore((state) => state.commands.addCartItem);
  const [category, setCategory] = useState<ShopCategoryFilter>(() =>
    normalizeCategory(initialCategory),
  );
  const [query, setQuery] = useState(initialQuery);
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase());
  const [sort, setSort] = useState<ShopSort>('featured');
  const [recentlyAdded, setRecentlyAdded] = useState<string | null>(null);

  const productViews = useMemo<ShopProductView[]>(
    () =>
      products.map((product) => {
        const stock = inventory.find((item) => item.productId === product.id);
        const availableStock = Math.max(
          0,
          (stock?.stockOnHand ?? 0) - (stock?.stockReserved ?? 0),
        );

        return {
          ...product,
          availableStock,
          isAvailable: product.isActive && availableStock > 0,
        };
      }),
    [inventory, products],
  );

  const visibleProducts = useMemo(() => {
    const filtered = productViews.filter((product) => {
      const matchesCategory =
        category === 'all' ||
        product.category === category ||
        (category === 'accessories' && accessoryUnits.includes(product.unit as ProductUnit));
      const searchableText = `${product.name} ${product.shortDescription} ${product.category}`.toLocaleLowerCase();
      return matchesCategory && searchableText.includes(deferredQuery);
    });

    return [...filtered].sort((left, right) => {
      if (sort === 'price-low') return left.priceCentavos - right.priceCentavos;
      if (sort === 'price-high') return right.priceCentavos - left.priceCentavos;
      if (sort === 'name') return left.name.localeCompare(right.name);
      const leftProduct = products.find((product) => product.id === left.id);
      const rightProduct = products.find((product) => product.id === right.id);
      return Number(Boolean(rightProduct?.isFeatured)) - Number(Boolean(leftProduct?.isFeatured));
    });
  }, [category, deferredQuery, productViews, products, sort]);

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
            <Title>Shop household essentials</Title>
            <Introduction>
              Browse fictional demo stock for LPG refills, purified water, and
              practical accessories. Availability updates from the shared
              prototype inventory.
            </Introduction>
          </div>
          <CoverageLink href="/about-delivery">
            Check delivery coverage and fees
          </CoverageLink>
        </Intro>

        <ToolBar role="search" aria-label="Search and sort products">
          <SearchField
            fullWidth
            label="Search products"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try LPG, water, or regulator"
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
          {categoryOptions.map((option) => (
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

        <ResultsBar aria-live="polite">
          <ResultsCount>
            {visibleProducts.length}{' '}
            {visibleProducts.length === 1 ? 'product' : 'products'} found
          </ResultsCount>
          <ResultsCount>Fictional prototype inventory</ResultsCount>
        </ResultsBar>

        {visibleProducts.length ? (
          <ProductGrid>
            {visibleProducts.map((product, index) => (
              <ProductArticle
                aria-labelledby={`shop-product-${product.id}`}
                key={product.id}
              >
                <ProductLink href={`/product/${product.id}`}>
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
                  <ProductLink href={`/product/${product.id}`}>
                    <ProductName id={`shop-product-${product.id}`}>
                      {product.name}
                    </ProductName>
                  </ProductLink>
                  <ProductDescription>{product.shortDescription}</ProductDescription>
                  <ProductPrice>{formatPhp(product.priceCentavos)}</ProductPrice>
                  <ProductAvailability $available={product.isAvailable}>
                    {product.isAvailable
                      ? `${product.availableStock} available in demo stock`
                      : 'Currently unavailable'}
                  </ProductAvailability>
                  <AddButton
                    disabled={!product.isAvailable}
                    onClick={() => {
                      const result = addCartItem(product.id);
                      setRecentlyAdded(result.ok ? product.id : null);
                    }}
                    variant="contained"
                  >
                    Add to prototype cart
                  </AddButton>
                  <Feedback aria-atomic="true" aria-live="polite">
                    {recentlyAdded === product.id
                      ? `${product.name} added to your prototype cart.`
                      : ''}
                  </Feedback>
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
    </Root>
  );
}

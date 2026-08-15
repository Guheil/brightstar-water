'use client';

import { Droplets, Flame, ShoppingBasket } from 'lucide-react';
import { EmptyState, QuantityControl } from '@/components';
import { useAppStore } from '@/store';
import { calculateCartSubtotal, formatPhp, getAvailableStock } from '@/utils';
import { useCustomerCart } from '../_shared/CustomerAreaShell';
import {
  CartLayout,
  CartList,
  CartPage,
  CartRow,
  CategoryVisual,
  CheckoutLink,
  ContinueLink,
  FeeNote,
  Header,
  Lead,
  LinePrice,
  ProductInfo,
  ProductMeta,
  ProductName,
  RemoveButton,
  RowActions,
  SummaryList,
  SummaryPanel,
  SummaryRow,
  SummaryTitle,
  SummaryTotal,
  Title,
} from './elements';

export default function CartScreen() {
  const { items, itemCount, removeItem, updateQuantity } = useCustomerCart();
  const products = useAppStore((state) => state.catalog.products);
  const inventory = useAppStore((state) => state.inventory.items);
  const lines = items.flatMap((cartItem) => {
    const product = products.find((item) => item.id === cartItem.productId);
    const inventoryItem = inventory.find((item) => item.productId === cartItem.productId);
    return product && inventoryItem
      ? [{ cartItem, product, availableStock: getAvailableStock(inventoryItem) }]
      : [];
  });
  const subtotal = calculateCartSubtotal(
    lines.map(({ cartItem, product }) => ({
      quantity: cartItem.quantity,
      unitPriceCentavos: product.priceCentavos,
    })),
  );

  return (
    <CartPage>
      <Header>
        <Title>Your cart</Title>
        <Lead>
          Check quantities before choosing a delivery address, schedule, and payment method.
        </Lead>
      </Header>

      {!lines.length ? (
        <EmptyState
          action={<ContinueLink href="/">Choose a storefront</ContinueLink>}
          description="Add a product to begin your order."
          icon={<ShoppingBasket />}
          title="Your cart is empty"
        />
      ) : (
        <CartLayout>
          <CartList aria-label="Cart products">
            {lines.map(({ cartItem, product, availableStock }) => (
              <CartRow key={product.id}>
                <CategoryVisual $category={product.category}>
                  {product.category === 'gas' ? <Flame aria-hidden="true" /> : <Droplets aria-hidden="true" />}
                </CategoryVisual>
                <ProductInfo>
                  <ProductName>{product.name}</ProductName>
                  <ProductMeta>
                    {formatPhp(product.priceCentavos)} each · {availableStock} available
                  </ProductMeta>
                  <RowActions>
                    <QuantityControl
                      label={product.name}
                      max={availableStock}
                      onChange={(quantity) => updateQuantity(product.id, quantity)}
                      value={cartItem.quantity}
                    />
                    <RemoveButton onClick={() => removeItem(product.id)}>
                      Remove
                    </RemoveButton>
                  </RowActions>
                </ProductInfo>
                <LinePrice>
                  {formatPhp(product.priceCentavos * cartItem.quantity)}
                </LinePrice>
              </CartRow>
            ))}
          </CartList>

          <SummaryPanel>
            <SummaryTitle>Order estimate</SummaryTitle>
            <SummaryList>
              <SummaryRow>
                <dt>Items ({itemCount})</dt>
                <dd>{formatPhp(subtotal)}</dd>
              </SummaryRow>
              <SummaryRow>
                <dt>Delivery</dt>
                <dd>Calculated at checkout</dd>
              </SummaryRow>
              <SummaryTotal>
                <dt>Subtotal</dt>
                <dd>{formatPhp(subtotal)}</dd>
              </SummaryTotal>
            </SummaryList>
            <CheckoutLink href="/customer/checkout">Continue to checkout</CheckoutLink>
            <ContinueLink href="/">Choose a storefront</ContinueLink>
            <FeeNote>
              Delivery fees: free through 3 km, ₱30 over 3 through 6 km, and ₱50 over 6 through 10 km. Addresses beyond 10 km are outside the service area.
            </FeeNote>
          </SummaryPanel>
        </CartLayout>
      )}
    </CartPage>
  );
}

'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import EmptyState from '@/components/ui/EmptyState';
import QuantityControl from '@/components/ui/QuantityControl';
import AuthRequiredDialog from '@/screens/public/AuthRequiredDialog';
import { useAppStore } from '@/store';
import { formatPhp } from '@/utils';
import type { ProductDetailScreenProps } from './interface';
import {
  AddButton,
  Availability,
  BackLink,
  Category,
  Container,
  DeliveryLink,
  DeliveryNote,
  DeliveryText,
  DeliveryTitle,
  Description,
  DetailGrid,
  Divider,
  Feedback,
  MissingPanel,
  Price,
  ProductCopy,
  ProductImage,
  ProductMedia,
  PurchaseRow,
  QuantityLabel,
  Root,
  Title,
} from './elements';

export default function ProductDetailScreen({
  deliveryHref = '/about-delivery',
  expectedCategory,
  productId,
  shopHref = '/shop',
}: ProductDetailScreenProps) {
  const pathname = usePathname();
  const session = useAppStore((state) => state.auth.session);
  const isCustomer = session?.user.role === 'customer' && Boolean(session.user.customerId);
  const product = useAppStore((state) =>
    state.catalog.products.find(
      (item) => item.id === productId || item.slug === productId,
    ),
  );
  const inventory = useAppStore((state) =>
    state.inventory.items.find((item) => item.productId === product?.id),
  );
  const addCartItem = useAppStore((state) => state.commands.addCartItem);
  const availableStock = Math.max(
    0,
    (inventory?.stockOnHand ?? 0) - (inventory?.stockReserved ?? 0),
  );
  const [quantity, setQuantity] = useState(1);
  const [addedQuantity, setAddedQuantity] = useState(0);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);

  if (!product || (expectedCategory && product.category !== expectedCategory)) {
    return (
      <Root>
        <Container>
          <MissingPanel>
            <EmptyState
              action={<BackLink href={shopHref}>Return to shop</BackLink>}
              description="This product may have been removed or the link is incorrect."
              title="Product not found"
            />
          </MissingPanel>
        </Container>
      </Root>
    );
  }

  const isAvailable = product.isActive && availableStock > 0;

  return (
    <Root>
      <Container>
        <BackLink href={shopHref}>← Back to storefront products</BackLink>
        <DetailGrid>
          <ProductMedia>
            <ProductImage
              alt={product.imageAlt}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 56vw"
              src={product.imageSrc}
            />
          </ProductMedia>
          <ProductCopy>
            <Category $tone={product.category}>
              {product.category} · {product.unit}
            </Category>
            <Title>{product.name}</Title>
            <Price>{formatPhp(product.priceCentavos)}</Price>
            <Availability $available={isAvailable}>
              {isAvailable
                ? `${availableStock} available`
                : 'Currently unavailable'}
            </Availability>
            <Description>{product.description}</Description>
            <Divider />
            <QuantityLabel id="product-quantity-label">Quantity</QuantityLabel>
            <PurchaseRow>
              <QuantityControl
                disabled={!isAvailable}
                label={product.name}
                max={Math.max(1, availableStock)}
                onChange={setQuantity}
                value={quantity}
              />
              <AddButton
                disabled={!isAvailable}
                onClick={() => {
                  if (!isCustomer) {
                    setAuthPromptOpen(true);
                    return;
                  }
                  const result = addCartItem(product.id, quantity);
                  setAddedQuantity(result.ok ? quantity : 0);
                }}
                variant="contained"
              >
                Add {formatPhp(product.priceCentavos * quantity)} to cart
              </AddButton>
            </PurchaseRow>
            <Feedback aria-atomic="true" aria-live="polite">
              {addedQuantity
                ? `${addedQuantity} ${addedQuantity === 1 ? 'item' : 'items'} added to your cart.`
                : ''}
            </Feedback>
            <DeliveryNote>
              <DeliveryTitle>Scheduled local delivery</DeliveryTitle>
              <DeliveryText>
                Delivery fees are based on distance from the store. Checkout
                blocks addresses outside the 10 km service area.
              </DeliveryText>
              <DeliveryLink href={deliveryHref}>
                Review delivery zones and payment options
              </DeliveryLink>
            </DeliveryNote>
          </ProductCopy>
        </DetailGrid>
      </Container>
      <AuthRequiredDialog
        nextPath={pathname}
        onClose={() => setAuthPromptOpen(false)}
        open={authPromptOpen}
      />
    </Root>
  );
}

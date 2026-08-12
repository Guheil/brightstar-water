'use client';

import { useState } from 'react';
import EmptyState from '@/components/ui/EmptyState';
import QuantityControl from '@/components/ui/QuantityControl';
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
  productId,
}: ProductDetailScreenProps) {
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

  if (!product) {
    return (
      <Root>
        <Container>
          <MissingPanel>
            <EmptyState
              action={<BackLink href="/shop">Return to shop</BackLink>}
              description="This fictional product may have been removed or the link is incorrect."
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
        <BackLink href="/shop">← Back to all products</BackLink>
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
                ? `${availableStock} available in fictional demo stock`
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
                  const result = addCartItem(product.id, quantity);
                  setAddedQuantity(result.ok ? quantity : 0);
                }}
                variant="contained"
              >
                Add {formatPhp(product.priceCentavos * quantity)} to prototype cart
              </AddButton>
            </PurchaseRow>
            <Feedback aria-atomic="true" aria-live="polite">
              {addedQuantity
                ? `${addedQuantity} ${addedQuantity === 1 ? 'item' : 'items'} added to your prototype cart.`
                : ''}
            </Feedback>
            <DeliveryNote>
              <DeliveryTitle>Scheduled local delivery</DeliveryTitle>
              <DeliveryText>
                Delivery fees use a fictional zone distance. Checkout will
                block addresses outside the 10 km prototype service area.
              </DeliveryText>
              <DeliveryLink href="/about-delivery">
                Review delivery zones and payment options
              </DeliveryLink>
            </DeliveryNote>
          </ProductCopy>
        </DetailGrid>
      </Container>
    </Root>
  );
}

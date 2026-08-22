'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import AddToCartConfirmDialog from '@/components/ui/AddToCartConfirmDialog';
import CartAddedToast from '@/components/ui/CartAddedToast';
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
  initialProduct = null,
  initialInventory = null,
  shopHref = '/shop',
}: ProductDetailScreenProps) {
  const pathname = usePathname();
  const session = useAppStore((state) => state.auth.session);
  const isCustomer = session?.user.role === 'customer' && Boolean(session.user.customerId);
  const storeProduct = useAppStore((state) =>
    state.catalog.products.find(
      (item) => item.id === productId || item.slug === productId,
    ),
  );
  const catalogInitialized = useAppStore((state) => state.catalog.initialized);
  const product = storeProduct ?? initialProduct ?? undefined;
  const storeInventory = useAppStore((state) =>
    state.inventory.items.find((item) => item.productId === product?.id),
  );
  const inventory = storeInventory ?? (initialInventory?.productId === product?.id ? initialInventory : undefined);
  const cartReady = useAppStore((state) => state.cart.initialized && Boolean(state.cart.ownerCustomerId));
  const cartQuantity = useAppStore((state) =>
    state.cart.items.find((item) => item.productId === product?.id)?.quantity ?? 0,
  );
  const addCartItem = useAppStore((state) => state.commands.addCartItem);
  const availableStock = Math.max(
    0,
    (inventory?.stockOnHand ?? 0) - (inventory?.stockReserved ?? 0),
  );
  const maxAddableQuantity = Math.max(0, availableStock - cartQuantity);
  const [quantity, setQuantity] = useState(1);
  const [pendingQuantity, setPendingQuantity] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastSequence, setToastSequence] = useState(0);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const selectedQuantity = maxAddableQuantity > 0
    ? Math.min(quantity, maxAddableQuantity)
    : quantity;

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
                max={Math.max(1, maxAddableQuantity)}
                onChange={setQuantity}
                value={selectedQuantity}
              />
              <AddButton
                disabled={!isAvailable || !catalogInitialized || maxAddableQuantity <= 0 || (isCustomer && !cartReady)}
                onClick={() => {
                  if (!isCustomer) {
                    setAuthPromptOpen(true);
                    return;
                  }
                  setPendingQuantity(selectedQuantity);
                }}
                variant="contained"
              >
                Add {formatPhp(product.priceCentavos * selectedQuantity)} to cart
              </AddButton>
            </PurchaseRow>
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
      <AddToCartConfirmDialog
        maxQuantity={Math.max(1, maxAddableQuantity)}
        onClose={() => setPendingQuantity(null)}
        onConfirm={() => {
          const confirmedQuantity = pendingQuantity;
          setPendingQuantity(null);
          if (!confirmedQuantity) return;

          const result = addCartItem(product.id, confirmedQuantity);
          if (!result.ok) return;

          setQuantity(confirmedQuantity);
          setToastMessage(
            confirmedQuantity === 1
              ? `${product.name} added to your cart.`
              : `${confirmedQuantity} × ${product.name} added to your cart.`,
          );
          setToastSequence((current) => current + 1);
        }}
        onQuantityChange={setPendingQuantity}
        open={pendingQuantity !== null}
        productName={product.name}
        quantity={pendingQuantity ?? selectedQuantity}
        subtotalLabel={formatPhp(
          product.priceCentavos * (pendingQuantity ?? selectedQuantity),
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

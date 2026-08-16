export interface ProductDeletionReferences {
  hasInventoryHistory: boolean;
  hasOrderHistory: boolean;
  hasReservedStock: boolean;
  isInCart: boolean;
}

export function canHardDeleteProduct(references: ProductDeletionReferences): boolean {
  return !(
    references.hasInventoryHistory ||
    references.hasOrderHistory ||
    references.hasReservedStock ||
    references.isInCart
  );
}

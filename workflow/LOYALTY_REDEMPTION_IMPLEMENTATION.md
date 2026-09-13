# Loyalty Redemption Implementation

## Thesis basis

This implementation follows the loyalty rules stated in the submitted thesis:

- a qualified purchase earns one point for every ₱100 spent;
- a qualifying purchase must meet the ₱500 merchandise threshold;
- one loyalty point has a fixed monetary value of ₱1;
- available points may produce a discounted total before payment.

The thesis contains inconsistent examples for the additional bonus rule. One section describes three qualified orders within two weeks, while the flowchart discussion gives examples involving the 3rd, 5th, or 10th purchase. Because the exact bonus computation is not defined consistently, bonus calculation remains disabled instead of inventing a rule.

## Customer checkout flow

1. Checkout loads the authenticated customer's current loyalty balance from the operational snapshot.
2. The customer may enter a whole number of points or choose **Use maximum**.
3. One point reduces merchandise by ₱1. Delivery fees are not reduced by loyalty points.
4. Checkout never permits redemption above the current available balance, the merchandise subtotal, or the configured per-order safety limit.
5. The review and order summary show the selected points and loyalty discount before the customer places the order.
6. For a zero-balance order, GCash is not offered because there is no amount to send. The order can continue with no amount due.
7. Checkout submits only the requested point count and the balance snapshot the customer saw. The browser-computed discount and total are never trusted by the server.

## Server and database calculation

Migration:

`supabase/migrations/202609120003_loyalty_redemption.sql`

The database recalculates and validates the redemption inside the order transaction. It:

- locks the customer loyalty balance with the same customer-specific advisory lock used by Admin loyalty adjustments;
- verifies the balance still matches the checkout snapshot;
- rejects a stale balance instead of silently lowering the requested redemption;
- caps redemption to the merchandise subtotal;
- converts each redeemed point to 100 centavos;
- deducts the points;
- updates the stored order total, payment amount, and COD collection amount;
- records the redemption in the loyalty ledger and order timeline;
- calculates points pending from the merchandise value actually paid after the loyalty discount.

If any step fails, PostgreSQL rolls the complete order transaction back, including the point deduction and stock reservation.

## Loyalty lifecycle

### Redemption

A successful redemption creates:

- `orders.loyalty_points_redeemed`;
- `orders.loyalty_redeemed_at`;
- the existing `orders.loyalty_discount_centavos` amount;
- a `loyalty_activity` entry with type `redeemed`;
- an order event with type `loyalty_redeemed`.

### Earning

Pending points are calculated from merchandise spend after redemption. For example, a ₱1,000 merchandise subtotal with a ₱200 loyalty discount has ₱800 of eligible paid merchandise and therefore earns 8 pending points.

The existing delivery-completion flow settles those pending points only after successful delivery.

### Cancellation and failed delivery

If an order with redeemed points is later:

- cancelled through an approved cancellation request; or
- placed into the current terminal `delivery_failed` state,

the redeemed points are restored exactly once. The order receives `loyalty_redemption_restored_at`, a `restored` loyalty activity entry, and a `loyalty_restored` timeline event. Pending earned points are cleared because the order did not complete successfully.

Historical order/payment totals remain the amounts that applied to that transaction. Point restoration does not rewrite the old financial snapshot.

## User interface

Updated customer areas:

- `src/screens/customer/CheckoutScreen/`
- `src/screens/customer/LoyaltyScreen/`
- `src/screens/customer/AccountScreen/index.tsx`
- `src/screens/customer/OrderDetailScreen/index.tsx`
- `src/screens/customer/OrderConfirmationScreen/index.tsx`

Updated Admin view:

- `src/screens/admin/OrderDetailScreen/index.tsx`

The checkout implementation follows the existing MUI three-file structure. Visual changes use existing theme tokens and styled components only.

## FAQ

The customer Help Center now explains that available points may be used during checkout at ₱1 per point and that loyalty discounts apply to merchandise rather than delivery fees.

## Deployment requirement

Apply:

`supabase/migrations/202609120003_loyalty_redemption.sql`

after the existing order and dynamic GCash migrations.

The application code expects the new order redemption columns, activity/event types, and redemption-aware order RPC to exist on the hosted Supabase project.

## Manual acceptance checklist

1. Apply migration `202609120003_loyalty_redemption.sql`.
2. Sign in as a Customer with available loyalty points.
3. Confirm Checkout shows the correct available balance and `1 point = ₱1`.
4. Redeem part of the balance and confirm only merchandise is discounted.
5. Use **Use maximum** and confirm the value is capped by balance and merchandise subtotal.
6. Try a decimal, negative, or excessive value and confirm placement is blocked.
7. Place a COD order and verify order total, payment amount, and amount to collect all use the discounted total.
8. Place a GCash order and verify the displayed amount and stored payment amount use the discounted total.
9. Confirm the loyalty account decreases by the exact number of redeemed points.
10. Confirm `redeemed` activity and `loyalty_redeemed` order timeline entries are recorded.
11. Change the customer's loyalty balance from another session before submitting an already-open checkout and confirm the stale-balance warning stops placement.
12. Approve cancellation of a redeemed order and confirm points are restored once and pending earned points become zero.
13. Complete another redeemed order successfully and confirm redeemed points remain spent while pending earned points settle normally.
14. Fail an out-for-delivery redeemed order and confirm points are restored once and pending points are cleared.
15. Confirm order details, confirmation, Admin details, GCash amount, and COD collection all show the same canonical discounted total.
16. Confirm the bonus rule remains disabled until its exact business formula is formally confirmed.

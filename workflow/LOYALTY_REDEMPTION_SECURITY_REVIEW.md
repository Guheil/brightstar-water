# Loyalty Redemption Security Review

## Trust boundary

Loyalty points have direct monetary value in this system. Browser-provided balances, discount amounts, final totals, customer IDs, and loyalty ledger mutations are therefore untrusted.

The client sends only:

- the requested whole-number point count; and
- the available-balance snapshot that was displayed to the customer.

The authenticated Customer identity is derived on the server. The authoritative balance, merchandise subtotal, discount, total, and new points balance are derived and enforced in PostgreSQL.

## Authentication and authorization

The order endpoint keeps the existing Customer-only operational context. It requires an authenticated, active Customer who has completed onboarding and applies the persistent database-backed rate limiter.

No customer ID is accepted from the order payload. The API passes the authenticated profile ID to the database RPC, and the RPC repeats the active-Customer assertion before creating the order.

Operational loyalty tables remain unavailable to browser roles. Server-side privileged access stays behind the existing server-only Supabase Admin client.

## Input validation and mass assignment

The order Zod schema accepts an optional `requestedLoyaltyPoints` integer bounded from 0 through 100,000. A balance snapshot is required only when points are actually being redeemed.

The browser cannot assign:

- `loyalty_discount_centavos`;
- `total_centavos`;
- `loyalty_points_pending`;
- `loyalty_points_awarded`;
- `loyalty_points_redeemed`;
- redemption/restoration timestamps;
- loyalty activity/event rows.

Those fields are written from the database transaction only.

## Concurrency and double-spend protection

The redemption-aware order function uses the same customer-specific PostgreSQL advisory lock as the existing Admin loyalty-adjustment function. It then locks the loyalty account row before validating and deducting points.

This serializes competing operations for the same customer's balance, including:

- two simultaneous checkout attempts;
- an Admin adjustment racing with checkout;
- a restoration operation racing another loyalty mutation.

The customer's submitted balance snapshot is used only as a stale-view guard. The real balance is read from the locked database row. A mismatch rejects the order rather than silently changing the discount the customer reviewed.

## Transactional integrity

The existing order RPC, GCash settings/version verification, loyalty redemption, stock reservation, payment record, delivery record, loyalty activity, and order timeline all execute in one PostgreSQL transaction.

If loyalty validation fails after the base order operation has started, raising the database exception rolls back the entire outer transaction. The customer does not lose points or retain a partial stock reservation/order.

The existing customer/idempotency-key uniqueness contract is checked before points are spent, so a retry of the same successfully completed request returns the original order rather than spending the balance again.

## Monetary invariants

Database constraints enforce:

- redeemed points cannot be negative;
- one redeemed point equals exactly 100 centavos of loyalty discount;
- the loyalty discount cannot exceed merchandise subtotal;
- redemption timestamps are consistent with whether points were actually spent.

Delivery fee is excluded from redemption. The stored total is still protected by the existing `orders_total_math` constraint.

GCash is rejected when the final amount due is zero, preventing a meaningless payment-proof flow for a ₱0 transaction. A zero-balance order may continue through the no-payment-due/COD path.

## Cancellation and failed-delivery restoration

The private restoration helper locks the order, checks whether points were redeemed and whether a restoration has already occurred, acquires the same customer loyalty advisory lock, credits the account, records the ledger/timeline entries, and timestamps the restoration.

A partial unique index also permits at most one `redeemed` and one `restored` loyalty activity record per order. These controls make restoration idempotent and prevent repeated cancellation/failure handling from crediting the same points twice.

## Earning after redemption

Pending earned points are calculated from net paid merchandise after the loyalty discount. This prevents customers from earning new points on value paid using previously earned loyalty points.

The existing ₱500 qualifying threshold and ₱100-per-point rule are reused on that net merchandise amount. Delivery fee remains outside loyalty earning.

## CSRF, request size, rate limiting, and evidence upload

The customer order route continues to require:

- same-origin mutation;
- multipart form data;
- a bounded request size;
- strict structured payload validation;
- persistent per-user rate limiting;
- private/no-store responses.

GCash proof files continue through the existing validated private evidence-upload path. Loyalty fields do not alter the evidence trust boundary.

## SQL/RPC exposure

The new redemption-aware RPC is executable only by `service_role`. The previous GCash wrapper remains available only for the new security-definer wrapper's internal owner-context call, preventing application server callers from bypassing the redemption-aware entry point.

The private restoration helper explicitly revokes execution from public, anonymous, authenticated, and service-role database roles. It is invoked only from authorized security-definer operational functions.

## Bonus rule

No bonus computation was added. The thesis materials contain inconsistent descriptions of the bonus trigger and do not provide a single defensible exact formula. Inventing one would create an unreviewed monetary rule. The existing bonus configuration therefore remains disabled until the business/thesis owner confirms the formula.

## Validation limitations

The supplied project archive does not contain `package.json`, a lockfile, `tsconfig.json`, or the project ESLint/Vitest configuration and dependencies. A normal project ESLint/Vitest/typecheck/build cannot be executed from this archive.

Validation for this change uses source parsing, focused static regression checks, endpoint scanning with manual wrapper-aware review, SQL structure checks, and ZIP integrity validation. Per the repository skill, `npm run build` is not run.

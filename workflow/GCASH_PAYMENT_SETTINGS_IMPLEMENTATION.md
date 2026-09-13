# Dynamic GCash Payment Settings Implementation

## Scope

GCash payment instructions are no longer compiled into the frontend. An Administrator can change the active GCash recipient name, mobile number, QR code, and availability from the Admin portal. Customer checkout reads the current configuration at payment time.

## Admin flow

1. Open **Admin > Payment settings**.
2. Set the recipient name.
3. Add a GCash number, a QR image, or both.
4. Enable or disable GCash.
5. Save.

GCash cannot be enabled without a recipient name and at least one usable payment destination. A configured QR can be replaced or removed later.

## Customer flow

1. When checkout reaches the Payment step, the customer client requests the current safe GCash view from `/api/customer/payment-settings`.
2. If GCash is disabled, incomplete, or the configured QR cannot be served and there is no number fallback, GCash remains unavailable and COD continues to work.
3. When the customer confirms GCash, checkout locks the exact settings version and instructions that were shown.
4. The customer pays using the displayed number and/or QR, then uploads payment proof.
5. Order submission includes the locked GCash settings version.
6. The server and database require that version to still be current. If an Administrator changed the destination while checkout was open, the order is stopped and the customer must review the refreshed instructions.

## Database design

Migration:

`supabase/migrations/202609120002_dynamic_gcash_payment_settings.sql`

It adds:

- `public.payment_settings`, with a singleton `gcash` row.
- GCash snapshot columns on `public.payments`.
- `public.admin_update_gcash_payment_settings(...)` for authorized, audited Admin mutations.
- `public.customer_place_order_with_payment_settings(...)` for transactionally validating the settings version and snapshotting the payment destination into the payment record.

The payment snapshot preserves the recipient/version that applied to each GCash order. Future Admin changes do not rewrite old transaction history.

## QR storage

QR images are stored in the private Supabase Storage bucket `payment-assets`.

The application creates the bucket lazily on the first valid QR upload. New uploads are:

- restricted to JPEG, PNG, or WebP input;
- decoded and validated with Sharp;
- subject to file-size and pixel-count limits;
- resized only when necessary;
- re-encoded to WebP before Storage;
- served to customers through short-lived signed URLs.

Previous QR objects are intentionally retained after a successful replacement/removal. They remain private and may still be referenced by a historical payment snapshot or by an in-flight signed URL that was issued immediately before the settings changed. Newly uploaded files are cleaned up if the database mutation fails.

## Runtime files

Primary implementation files:

- `src/screens/admin/PaymentSettingsScreen/index.tsx`
- `src/screens/admin/PaymentSettingsScreen/elements.tsx`
- `src/screens/admin/PaymentSettingsScreen/interface.ts`
- `src/app/(admin)/admin/payment-settings/page.tsx`
- `src/app/api/admin/payment-settings/route.ts`
- `src/app/api/customer/payment-settings/route.ts`
- `src/lib/payments/server.ts`
- `src/lib/payments/imageServer.ts`
- `src/lib/payments/client.ts`
- `src/lib/payments/types.ts`
- `src/lib/payments/validation.ts`
- `src/screens/customer/CheckoutScreen/index.tsx`
- `src/app/api/customer/orders/route.ts`
- `src/lib/orders/validation.ts`
- `src/lib/orders/types.ts`
- `src/lib/orders/apiServer.ts`
- `src/config/payment.ts`

## Deployment requirement

The new migration must be applied to the actual Supabase project before the feature can work. Until the migration exists on the hosted project, the new Admin and customer payment-setting APIs will not have the required table/RPCs.

No real recipient name, number, or QR is hardcoded in source code.

## Manual acceptance checklist

1. Apply migration `202609120002_dynamic_gcash_payment_settings.sql`.
2. Sign in as an active Administrator.
3. Open **Payment settings** and confirm GCash starts disabled.
4. Confirm enabling with no recipient/destination is rejected.
5. Save a recipient plus number only; confirm checkout shows the number and Copy action.
6. Replace with QR only; confirm checkout shows the signed QR and still permits GCash.
7. Configure both number and QR; confirm both are shown.
8. Upload an invalid/non-image or oversized file and confirm it is rejected.
9. Start customer checkout, lock GCash instructions, then change the settings in Admin. Confirm old checkout receives the stale-settings warning on order submission and must review the current destination.
10. Submit a current GCash order and confirm its `payments` row contains the settings version and destination snapshot.
11. Change Admin GCash settings again and confirm the historical payment snapshot remains unchanged.
12. Disable GCash and confirm new checkout sessions expose COD only.
13. Confirm a Customer/Deliverer cannot open or mutate the Admin payment-settings API.
14. Confirm COD order creation still works normally.

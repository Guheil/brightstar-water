# Dynamic GCash Payment Settings Security Review

## Trust boundaries

The browser is not trusted to decide who may edit payment instructions, which account record to update, whether a QR is safe, or whether the GCash instructions used for an order are still current.

Admin identity and role are resolved on the server from the authenticated session. Customer identity is likewise server-derived. No user-supplied actor ID is accepted as authorization input.

## Authentication and authorization

Admin reads and writes use the existing `getOperationsApiContext(..., 'admin')` boundary, which verifies the authenticated profile, role/status eligibility, and applies the persistent database-backed rate limiter.

Customer payment-setting reads use the same operational context restricted to the `customer` role.

The database mutation RPC calls the existing operational actor assertion again before modifying settings. The order wrapper also explicitly asserts an active Customer actor. These checks provide defense in depth around the service-role database connection.

## RLS and privileged credentials

`public.payment_settings` has RLS enabled and grants no browser role direct table access. Only `service_role` may read/write the table through the server-side application path.

Supabase service credentials are never imported into client components. Existing server-only Admin client helpers remain the only privileged database/storage client boundary.

## CSRF and request controls

The Admin PATCH endpoint requires a same-origin mutation and multipart form data. It rejects missing/invalid Content-Length values and caps the request at 4 MB. The structured payload has a separate small character limit and strict Zod schema.

The customer read endpoint is GET-only and returns no mutation capability.

## Mass assignment / IDOR

Admin input is restricted to:

- `enabled`
- `recipientName`
- `accountNumber`
- `removeQr`
- `expectedVersion`

Internal fields such as `updated_by`, `version`, Storage paths, actor IDs, audit fields, and payment snapshots cannot be directly assigned by browser input.

Customer order input contains only the settings version the customer actually reviewed. The authoritative destination comes from the locked database row inside the transaction, not from the customer's submitted recipient/number/path.

## Payment-destination validation

Recipient names are trimmed, bounded, and reject markup/control characters. Optional GCash numbers are normalized and must be an 11-digit Philippine mobile number beginning with `09`.

Database constraints repeat the important invariants. GCash cannot be enabled unless a recipient name and at least one destination (number or QR path) exist.

## QR upload safety

Uploaded QR input is treated as untrusted binary data. The server:

- limits the request and file size;
- accepts only JPEG/PNG/WebP input MIME types;
- decodes with Sharp rather than trusting the filename/extension;
- applies a pixel-count ceiling and dimension checks;
- re-encodes the result to WebP;
- stores only a generated UUID path under `gcash/`.

The bucket is private. Customer/Admin image previews use short-lived signed URLs. Public permanent QR URLs are not exposed.

## Race-condition / stale-checkout protection

Every Admin save increments `payment_settings.version`. Checkout locks the version it displayed. The order RPC locks the current settings row and rejects a GCash order if the submitted version no longer matches.

This prevents a customer from paying account A while the transaction is silently recorded against newly configured account B.

The settings update itself uses optimistic version checking so two Administrator sessions cannot silently overwrite each other's edits.

## Historical integrity

A successful GCash order snapshots:

- settings version;
- recipient name;
- account number;
- QR storage path.

Admin changes therefore do not mutate the payment instructions historically associated with an older order.

Previous QR Storage objects remain private instead of being immediately deleted after replacement. This protects historical references and already issued short-lived URLs. New orphan uploads are deleted when their corresponding database update fails.

## Logging and sensitive data

The Admin settings audit event records who changed the configuration, the new version, enabled state, and whether a number/QR exists. It intentionally does not place the full GCash number or QR path in audit metadata.

Unexpected server logs record generic error codes and actor IDs only, not payment destination values or uploaded image contents.

## Fail-closed behavior

GCash is unavailable when:

- settings cannot be loaded;
- the setting is disabled;
- recipient/destination requirements are incomplete;
- a QR-only configuration cannot produce a signed URL;
- the customer submits a stale version.

COD remains the non-GCash fallback where appropriate.

## Validation limitations

The provided project archive does not contain `package.json`, a lockfile, `tsconfig.json`, or installed project dependencies. Therefore a normal project ESLint/Vitest/typecheck/build cannot be executed from this archive.

Validation for this change uses TypeScript syntax transpilation, static security assertions, endpoint scanning followed by manual wrapper-aware review, source-reference checks, and ZIP integrity testing. Per the repository skill, `npm run build` is not run.

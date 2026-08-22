# Delivery Timing Implementation

The checkout schedule step now uses a dynamic Asia/Manila delivery estimate instead of hardcoded dates.

## Behavior
- Earliest available delivery is the default and requires no customer preference.
- Estimated arrival is calculated from preparation time plus a distance buffer, then placed into the next configured delivery window.
- Customers may optionally request a custom date up to 14 days from the earliest estimate.
- Preferred time is optional: Any available time, Morning, or Afternoon.
- New orders store both the system estimate and optional customer preference.
- The effective legacy `date` and `windowLabel` fields remain populated so existing Admin and Deliverer sorting stays compatible.
- Store-level validation rejects preferred dates outside the allowed range.

## Main files
- `src/config/deliveryTimingConfig.ts`
- `src/utils/deliveryTiming.ts`
- `src/types/delivery.ts`
- `src/screens/customer/CheckoutScreen/`

## Verification note
Vitest is configured, but dependencies could not be installed in the execution environment because npm registry access timed out. `npm test` therefore could not run here. `npm run build` was intentionally not run per the project skill.

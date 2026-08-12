import type { MoneyCentavos } from '@/types';

export interface DeliveryFeeBand {
  minExclusiveKm: number;
  maxInclusiveKm: number;
  feeCentavos: MoneyCentavos;
  label: string;
}

/** Prototype distances come from demo address fixtures, never live GPS. */
export const DELIVERY_FEE_CONFIG = {
  serviceRadiusKm: 10,
  bands: [
    {
      minExclusiveKm: -1,
      maxInclusiveKm: 3,
      feeCentavos: 0,
      label: 'Up to 3 km · Free delivery',
    },
    {
      minExclusiveKm: 3,
      maxInclusiveKm: 6,
      feeCentavos: 3_000,
      label: 'Over 3 km to 6 km · ₱30 delivery',
    },
    {
      minExclusiveKm: 6,
      maxInclusiveKm: 10,
      feeCentavos: 5_000,
      label: 'Over 6 km to 10 km · ₱50 delivery',
    },
  ] satisfies DeliveryFeeBand[],
} as const;


import type { EntityId, ISODateString, MoneyCentavos } from './shared';

export type LoyaltyActivityType = 'earned' | 'redeemed' | 'restored' | 'manual_credit' | 'manual_debit';

export interface LoyaltyActivity {
  id: EntityId;
  customerId: EntityId;
  type: LoyaltyActivityType;
  points: number;
  description: string;
  orderId?: EntityId;
  reason?: string;
  createdAt: ISODateString;
}

export interface LoyaltyAccount {
  customerId: EntityId;
  pointsAvailable: number;
  updatedAt: ISODateString;
}

export interface LoyaltyEffect {
  qualifyingSubtotalCentavos: MoneyCentavos;
  pointsPending: number;
  pointsAwarded: number;
  pointsRedeemed: number;
  discountCentavos: MoneyCentavos;
  redeemedAt?: ISODateString;
  redemptionRestoredAt?: ISODateString;
  settledAt?: ISODateString;
}


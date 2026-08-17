import type { EntityId, ISODateString } from './shared';

export type UserRole = 'customer' | 'admin' | 'deliverer';

export interface AuthUser {
  id: EntityId;
  role: UserRole;
  displayName: string;
  email: string;
  customerId?: EntityId;
  delivererId?: EntityId;
}

export interface AuthSession {
  user: AuthUser;
  signedInAt: ISODateString;
}

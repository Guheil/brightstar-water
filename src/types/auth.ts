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

export interface DemoAuthAccount extends AuthUser {
  /** A public prototype credential. It is not a production secret. */
  demoPassword: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthSession {
  user: AuthUser;
  signedInAt: ISODateString;
  isPrototypeSession: true;
}


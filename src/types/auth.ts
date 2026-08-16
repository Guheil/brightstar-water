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

export interface AuthAccount extends AuthUser {
  /** Account credential used by the current authentication service. */
  password: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthSession {
  user: AuthUser;
  signedInAt: ISODateString;
}

export interface CustomerRegistrationInput {
  displayName: string;
  email: string;
  phone: string;
  password: string;
}

export interface PendingCustomerRegistration extends CustomerRegistrationInput {
  verificationCode: string;
  expiresAt: ISODateString;
  attemptsRemaining: number;
}

export interface RegistrationChallenge {
  email: string;
  verificationCode: string;
  expiresAt: ISODateString;
  attemptsRemaining: number;
}

import { useAppStore } from '@/store';
import type { CommandResult, Customer, CustomerAccountStatus } from '@/types';
import { commandFailure, commandSuccess } from '@/utils';

export interface PrototypeCustomerUpdate {
  displayName: string;
  email: string;
  phonePlaceholder: string;
  status: CustomerAccountStatus;
}

export function updatePrototypeCustomer(
  customerId: string,
  input: PrototypeCustomerUpdate,
  updatedAt = new Date().toISOString(),
): CommandResult<Customer> {
  const state = useAppStore.getState();
  const customer = state.customers.records.find((item) => item.id === customerId);
  if (!customer) return commandFailure('not_found', 'Customer not found.');

  const displayName = input.displayName.trim();
  const email = input.email.trim().toLowerCase();
  const phonePlaceholder = input.phonePlaceholder.trim();
  if (!displayName || !email || !phonePlaceholder) {
    return commandFailure('invalid_input', 'Name, email, and contact number are required.');
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return commandFailure('invalid_input', 'Enter a valid email address.');
  }
  const duplicateEmail = state.customers.records.some(
    (item) => item.id !== customerId && item.email.toLowerCase() === email,
  );
  if (duplicateEmail) {
    return commandFailure('conflict', 'Another prototype customer already uses this email address.');
  }

  const updatedCustomer: Customer = {
    ...customer,
    displayName,
    email,
    phonePlaceholder,
    status: input.status,
    updatedAt,
  };
  useAppStore.setState((current) => ({
    customers: {
      ...current.customers,
      records: current.customers.records.map((item) =>
        item.id === customerId ? updatedCustomer : item,
      ),
    },
  }));
  return commandSuccess(updatedCustomer);
}

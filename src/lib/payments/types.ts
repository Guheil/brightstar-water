export interface GCashPaymentSettingsView {
  enabled: boolean;
  recipientName: string;
  accountNumber: string;
  qrImageUrl: string;
  qrConfigured: boolean;
  version: number;
  updatedAt?: string;
}

export interface UpdateGCashPaymentSettingsInput {
  enabled: boolean;
  recipientName: string;
  accountNumber: string;
  removeQr: boolean;
  expectedVersion: number;
}

import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import { GCASH_UNAVAILABLE_MESSAGE } from '@/config/payment';
import type { GCashPaymentSettingsView } from './types';

export const GCASH_SETTINGS_METHOD = 'gcash';
export const GCASH_QR_BUCKET = 'payment-assets';
export { GCASH_UNAVAILABLE_MESSAGE };
const SIGNED_QR_SECONDS = 15 * 60;

export interface GCashPaymentSettingsRow {
  method: 'gcash';
  enabled: boolean;
  recipient_name: string | null;
  account_number: string | null;
  qr_path: string | null;
  version: number | string;
  updated_at: string;
  updated_by: string | null;
}

export function isGCashSettingsUsable(row: GCashPaymentSettingsRow | null): boolean {
  return Boolean(
    row?.enabled
      && row.recipient_name?.trim()
      && (row.account_number?.trim() || row.qr_path?.trim()),
  );
}

export async function loadGCashPaymentSettingsRow(
  client: SupabaseClient,
): Promise<GCashPaymentSettingsRow> {
  const { data, error } = await client
    .from('payment_settings')
    .select('method,enabled,recipient_name,account_number,qr_path,version,updated_at,updated_by')
    .eq('method', GCASH_SETTINGS_METHOD)
    .single();

  if (error || !data) throw error ?? new Error('GCash payment settings are unavailable.');
  return data as GCashPaymentSettingsRow;
}

async function createQrSignedUrl(client: SupabaseClient, path: string | null): Promise<string> {
  if (!path) return '';
  const { data, error } = await client.storage.from(GCASH_QR_BUCKET).createSignedUrl(path, SIGNED_QR_SECONDS);
  if (error || !data?.signedUrl) return '';
  return data.signedUrl;
}

export async function toAdminGCashPaymentSettingsView(
  client: SupabaseClient,
  row: GCashPaymentSettingsRow,
): Promise<GCashPaymentSettingsView> {
  return {
    enabled: Boolean(row.enabled),
    recipientName: row.recipient_name ?? '',
    accountNumber: row.account_number ?? '',
    qrImageUrl: await createQrSignedUrl(client, row.qr_path),
    qrConfigured: Boolean(row.qr_path),
    version: Number(row.version),
    updatedAt: row.updated_at,
  };
}

export async function toCustomerGCashPaymentSettingsView(
  client: SupabaseClient,
  row: GCashPaymentSettingsRow,
): Promise<GCashPaymentSettingsView> {
  const rowUsable = isGCashSettingsUsable(row);
  const qrImageUrl = rowUsable && row.qr_path ? await createQrSignedUrl(client, row.qr_path) : '';
  const accessible = Boolean(
    rowUsable
      && row.recipient_name?.trim()
      && (row.account_number?.trim() || qrImageUrl),
  );
  return {
    enabled: accessible,
    recipientName: accessible ? row.recipient_name ?? '' : '',
    accountNumber: accessible ? row.account_number ?? '' : '',
    qrImageUrl: accessible ? qrImageUrl : '',
    qrConfigured: accessible && Boolean(qrImageUrl),
    version: Number(row.version),
  };
}

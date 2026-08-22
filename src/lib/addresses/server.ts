import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { DeliveryAddress } from '@/types';
import type { AddressMutationInput, PsgcLevel, PsgcOption } from './types';
import { PSGC_FALLBACK } from '@/data/psgcFallback';

interface AddressRow {
  id: string;
  address_type: 'home' | 'work' | 'other';
  custom_label: string | null;
  recipient_name: string;
  phone: string;
  region_code: string;
  region_name: string;
  province_code: string;
  province_name: string;
  municipality_code: string;
  municipality_name: string;
  barangay_code: string;
  barangay_name: string;
  address_line: string;
  landmark: string | null;
  delivery_note: string | null;
  latitude: number;
  longitude: number;
  distance_meters: number;
  is_default: boolean;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

export function mapAddressRow(row: AddressRow): DeliveryAddress {
  const label = row.address_type === 'home'
    ? 'Home'
    : row.address_type === 'work'
      ? 'Work'
      : row.custom_label || 'Other';

  return {
    id: row.id,
    addressType: row.address_type,
    ...(row.custom_label ? { customLabel: row.custom_label } : {}),
    label,
    recipientName: row.recipient_name,
    phonePlaceholder: row.phone,
    addressLine: row.address_line,
    area: row.barangay_name,
    municipality: row.municipality_name,
    province: row.province_name,
    regionCode: row.region_code,
    regionName: row.region_name,
    provinceCode: row.province_code,
    municipalityCode: row.municipality_code,
    barangayCode: row.barangay_code,
    landmark: row.landmark ?? undefined,
    distanceKm: Number((Number(row.distance_meters) / 1000).toFixed(2)),
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    ...(row.delivery_note ? { deliveryNote: row.delivery_note } : {}),
    isDefault: Boolean(row.is_default),
    lastUsedAt: row.last_used_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listCustomerAddresses(adminClient: SupabaseClient, actorId: string): Promise<DeliveryAddress[]> {
  const { data, error } = await adminClient.rpc('list_customer_addresses', { p_actor_id: actorId });
  if (error) throw error;
  return (Array.isArray(data) ? data : []).map((row) => mapAddressRow(row as AddressRow));
}

export function addressRpcPayload(input: AddressMutationInput) {
  return {
    p_address_type: input.addressType,
    p_custom_label: input.customLabel ?? null,
    p_recipient_name: input.recipientName,
    p_phone: input.phone,
    p_region_code: input.regionCode,
    p_region_name: input.regionName,
    p_province_code: input.provinceCode,
    p_province_name: input.provinceName,
    p_municipality_code: input.municipalityCode,
    p_municipality_name: input.municipalityName,
    p_barangay_code: input.barangayCode,
    p_barangay_name: input.barangayName,
    p_address_line: input.addressLine,
    p_landmark: input.landmark ?? null,
    p_delivery_note: input.deliveryNote ?? null,
    p_latitude: input.latitude,
    p_longitude: input.longitude,
    p_make_default: input.makeDefault ?? false,
  };
}

interface PsaRow {
  psgc_code?: unknown;
  area_name?: unknown;
  geographic_level?: unknown;
  reg?: unknown;
  prv?: unknown;
  mun?: unknown;
}

function parsePsaRows(payload: unknown): PsaRow[] {
  if (Array.isArray(payload)) return payload as PsaRow[];
  if (!payload || typeof payload !== 'object') return [];
  const record = payload as Record<string, unknown>;
  const results = record.results;
  if (Array.isArray(results)) return results as PsaRow[];
  if (results && typeof results === 'object') {
    const psgcData = (results as Record<string, unknown>).psgc_data;
    if (Array.isArray(psgcData)) return psgcData as PsaRow[];
  }
  const psgcData = record.psgc_data;
  return Array.isArray(psgcData) ? psgcData as PsaRow[] : [];
}

function toOption(row: PsaRow): PsgcOption | null {
  if (typeof row.psgc_code !== 'string' || !/^\d{10}$/.test(row.psgc_code)) return null;
  if (typeof row.area_name !== 'string' || !row.area_name.trim()) return null;
  const code = row.psgc_code;
  return {
    code,
    name: row.area_name.trim(),
    regionCode: `${code.slice(0, 2)}00000000`,
    ...(Number(row.prv) > 0 ? { provinceCode: `${code.slice(0, 5)}00000` } : {}),
    ...(Number(row.mun) > 0 ? { municipalityCode: `${code.slice(0, 7)}000` } : {}),
  };
}

export async function loadPsgcOptions(level: PsgcLevel, provinceCode?: string, municipalityCode?: string): Promise<PsgcOption[]> {
  const fallback = () => {
    if (level === 'regions') return [...PSGC_FALLBACK.regions];
    if (level === 'provinces') return [...PSGC_FALLBACK.provinces];
    if (level === 'municipalities') {
      return PSGC_FALLBACK.municipalities.filter((item) => !provinceCode || item.provinceCode === provinceCode);
    }
    return PSGC_FALLBACK.barangays.filter((item) => !municipalityCode || item.municipalityCode === municipalityCode);
  };

  const token = process.env.PSGC_API_TOKEN?.trim();
  const endpoint = new URL(`https://classification.psa.gov.ph/psgc/Q2_2024/${level}`);
  if (token) endpoint.searchParams.set('token', token);
  else endpoint.searchParams.set('format', 'api');
  endpoint.searchParams.set('page_size', '1000');

  if (level === 'municipalities' && provinceCode) endpoint.searchParams.set('prv', String(Number(provinceCode.slice(3, 5))));
  if (level === 'barangays' && municipalityCode) {
    endpoint.searchParams.set('prv', String(Number(municipalityCode.slice(3, 5))));
    endpoint.searchParams.set('mun', String(Number(municipalityCode.slice(5, 7))));
  }

  try {
    const response = await fetch(endpoint, {
      headers: { accept: 'application/json' },
      next: { revalidate: 86_400 },
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) return fallback();
    const rows = parsePsaRows(await response.json());
    const options = rows.map(toOption).filter((item): item is PsgcOption => Boolean(item));
    const filtered = level === 'municipalities' && provinceCode
      ? options.filter((item) => item.provinceCode === provinceCode)
      : level === 'barangays' && municipalityCode
        ? options.filter((item) => item.municipalityCode === municipalityCode)
        : options;
    return filtered.length ? filtered.sort((a, b) => a.name.localeCompare(b.name)) : fallback();
  } catch {
    return fallback();
  }
}

export async function canonicalizeAddressMutationInput(input: AddressMutationInput): Promise<AddressMutationInput | null> {
  const [regions, provinces] = await Promise.all([loadPsgcOptions('regions'), loadPsgcOptions('provinces')]);
  const province = provinces.find((item) => item.code === input.provinceCode);
  if (!province?.regionCode) return null;
  const region = regions.find((item) => item.code === province.regionCode);
  if (!region) return null;

  const municipalities = await loadPsgcOptions('municipalities', province.code);
  const municipality = municipalities.find((item) => item.code === input.municipalityCode);
  if (!municipality || municipality.provinceCode !== province.code) return null;

  const barangays = await loadPsgcOptions('barangays', municipality.code);
  const barangay = barangays.find((item) => item.code === input.barangayCode);
  if (!barangay || barangay.municipalityCode !== municipality.code) return null;

  return {
    ...input,
    regionCode: region.code,
    regionName: region.name,
    provinceCode: province.code,
    provinceName: province.name,
    municipalityCode: municipality.code,
    municipalityName: municipality.name,
    barangayCode: barangay.code,
    barangayName: barangay.name,
  };
}

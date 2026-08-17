import 'server-only';

import { createClient } from '@/lib/supabase/server';
import type { ProfileStatus, SupabaseProfile } from '@/lib/auth/types';
import type { UserRole } from '@/types';
import type {
  AdminProfileListFilters,
  AdminProfileListResult,
} from './types';
import { customerIdSchema } from './validation';

export const ADMIN_PROFILE_PAGE_SIZE = 25;

const ROLE_VALUES: readonly UserRole[] = ['customer', 'admin', 'deliverer'];
const STATUS_VALUES: readonly ProfileStatus[] = ['active', 'inactive'];

export function sanitizeAdminSearchQuery(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[^a-zA-Z0-9@._+\- ]/g, '')
    .trim()
    .slice(0, 80);
}

export function parseAdminProfileFilters(
  input: Record<string, string | string[] | undefined>,
): AdminProfileListFilters {
  const pageRaw = Array.isArray(input.page) ? input.page[0] : input.page;
  const roleRaw = Array.isArray(input.role) ? input.role[0] : input.role;
  const statusRaw = Array.isArray(input.status) ? input.status[0] : input.status;
  const queryRaw = Array.isArray(input.q) ? input.q[0] : input.q;
  const parsedPage = Number.parseInt(pageRaw ?? '1', 10);

  return {
    page: Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1,
    query: sanitizeAdminSearchQuery(queryRaw),
    role: ROLE_VALUES.includes(roleRaw as UserRole) ? (roleRaw as UserRole) : undefined,
    status: STATUS_VALUES.includes(statusRaw as ProfileStatus)
      ? (statusRaw as ProfileStatus)
      : undefined,
  };
}

function safeSearchFilter(search: string): string {
  return `full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`;
}

async function countProfiles(role?: UserRole, status?: ProfileStatus): Promise<number> {
  const supabase = await createClient();
  let query = supabase.from('profiles').select('id', { count: 'exact', head: true });
  if (role) query = query.eq('role', role);
  if (status) query = query.eq('status', status);
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export async function listManagedProfiles(
  filters: AdminProfileListFilters,
): Promise<AdminProfileListResult> {
  const supabase = await createClient();

  let countQuery = supabase.from('profiles').select('id', { count: 'exact', head: true });
  if (filters.role) countQuery = countQuery.eq('role', filters.role);
  if (filters.status) countQuery = countQuery.eq('status', filters.status);
  if (filters.query) countQuery = countQuery.or(safeSearchFilter(filters.query));

  const [countResult, customerCount, adminCount, delivererCount, activeCount, inactiveCount] =
    await Promise.all([
      countQuery,
      countProfiles('customer'),
      countProfiles('admin'),
      countProfiles('deliverer'),
      countProfiles(undefined, 'active'),
      countProfiles(undefined, 'inactive'),
    ]);

  if (countResult.error) throw countResult.error;

  const totalCount = countResult.count ?? 0;
  const pageCount = Math.max(1, Math.ceil(totalCount / ADMIN_PROFILE_PAGE_SIZE));
  const page = Math.min(filters.page, pageCount);
  const offset = (page - 1) * ADMIN_PROFILE_PAGE_SIZE;
  const end = offset + ADMIN_PROFILE_PAGE_SIZE - 1;

  let listQuery = supabase
    .from('profiles')
    .select('id,email,full_name,phone,role,status,created_at,updated_at')
    .order('created_at', { ascending: false })
    .range(offset, end);

  if (filters.role) listQuery = listQuery.eq('role', filters.role);
  if (filters.status) listQuery = listQuery.eq('status', filters.status);
  if (filters.query) listQuery = listQuery.or(safeSearchFilter(filters.query));

  const { data, error } = await listQuery;
  if (error) throw error;

  return {
    activeCount,
    adminCount,
    customerCount,
    delivererCount,
    inactiveCount,
    page,
    pageCount,
    profiles: (data ?? []) as SupabaseProfile[],
    totalCount,
  };
}

export async function listCustomers(
  filters: Omit<AdminProfileListFilters, 'role'>,
): Promise<AdminProfileListResult> {
  const supabase = await createClient();

  let countQuery = supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'customer');
  if (filters.status) countQuery = countQuery.eq('status', filters.status);
  if (filters.query) countQuery = countQuery.or(safeSearchFilter(filters.query));

  const [countResult, activeCount, inactiveCount, customerCount] = await Promise.all([
    countQuery,
    countProfiles('customer', 'active'),
    countProfiles('customer', 'inactive'),
    countProfiles('customer'),
  ]);

  if (countResult.error) throw countResult.error;

  const totalCount = countResult.count ?? 0;
  const pageCount = Math.max(1, Math.ceil(totalCount / ADMIN_PROFILE_PAGE_SIZE));
  const page = Math.min(filters.page, pageCount);
  const offset = (page - 1) * ADMIN_PROFILE_PAGE_SIZE;
  const end = offset + ADMIN_PROFILE_PAGE_SIZE - 1;

  let listQuery = supabase
    .from('profiles')
    .select('id,email,full_name,phone,role,status,created_at,updated_at')
    .eq('role', 'customer')
    .order('created_at', { ascending: false })
    .range(offset, end);
  if (filters.status) listQuery = listQuery.eq('status', filters.status);
  if (filters.query) listQuery = listQuery.or(safeSearchFilter(filters.query));

  const { data, error } = await listQuery;
  if (error) throw error;

  return {
    activeCount,
    adminCount: 0,
    customerCount,
    delivererCount: 0,
    inactiveCount,
    page,
    pageCount,
    profiles: (data ?? []) as SupabaseProfile[],
    totalCount,
  };
}

export async function getCustomerProfile(customerId: string): Promise<SupabaseProfile | null> {
  const parsedId = customerIdSchema.safeParse(customerId);
  if (!parsedId.success) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id,email,full_name,phone,role,status,created_at,updated_at')
    .eq('id', parsedId.data)
    .eq('role', 'customer')
    .maybeSingle();

  if (error) throw error;
  return data ? (data as SupabaseProfile) : null;
}

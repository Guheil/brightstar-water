import { redirect } from 'next/navigation';
import { parseAdminProfileFilters } from '@/lib/admin/server';

interface CustomersRedirectPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CustomersRedirectPage({ searchParams }: CustomersRedirectPageProps) {
  const filters = parseAdminProfileFilters(await searchParams);
  const params = new URLSearchParams({ role: 'customer' });
  if (filters.query) params.set('q', filters.query);
  if (filters.status) params.set('status', filters.status);
  if (filters.setup) params.set('setup', filters.setup);
  if (filters.page > 1) params.set('page', String(filters.page));
  redirect(`/admin/accounts?${params.toString()}`);
}

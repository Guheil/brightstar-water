import { listCustomers, parseAdminProfileFilters } from '@/lib/admin/server';
import CustomersScreen from '@/screens/admin/CustomersScreen';

interface CustomersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const parsed = parseAdminProfileFilters(await searchParams);
  const filters = {
    page: parsed.page,
    query: parsed.query,
    status: parsed.status,
  };
  const initialData = await listCustomers(filters);
  return <CustomersScreen filters={filters} initialData={initialData} />;
}

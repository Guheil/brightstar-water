import { listManagedProfiles, parseAdminProfileFilters } from '@/lib/admin/server';
import AccountsScreen from '@/screens/admin/AccountsScreen';

interface AccountsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AccountsPage({ searchParams }: AccountsPageProps) {
  const filters = parseAdminProfileFilters(await searchParams);
  const initialData = await listManagedProfiles(filters);
  return <AccountsScreen filters={filters} initialData={initialData} />;
}

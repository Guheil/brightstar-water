import { listManagedProfiles, parseAdminProfileFilters } from '@/lib/admin/server';
import { requireRole } from '@/lib/auth/server';
import AccountsScreen from '@/screens/admin/AccountsScreen';

interface AccountsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AccountsPage({ searchParams }: AccountsPageProps) {
  const actor = await requireRole('admin');
  const filters = parseAdminProfileFilters(await searchParams);
  const initialData = await listManagedProfiles(filters);
  return <AccountsScreen currentActorId={actor.id} filters={filters} initialData={initialData} />;
}

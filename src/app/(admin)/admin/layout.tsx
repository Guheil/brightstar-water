import AdminRouteShell from '@/screens/admin/AdminRouteShell';

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AdminRouteShell>{children}</AdminRouteShell>;
}

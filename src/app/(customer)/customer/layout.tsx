import CustomerAreaShell from '@/screens/customer/_shared/CustomerAreaShell';

export default function CustomerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <CustomerAreaShell>{children}</CustomerAreaShell>;
}


import FailureReportScreen from '@/screens/deliverer/FailureReportScreen';

interface FailureReportPageProps {
  params: Promise<{ id: string }>;
}

export default async function FailureReportPage({ params }: FailureReportPageProps) {
  const { id } = await params;
  return <FailureReportScreen deliveryId={id} />;
}

import AddressEditorScreen from '@/screens/customer/AddressEditorScreen';
interface PageProps { params: Promise<{ id: string }>; }
export default async function EditAddressPage({ params }: PageProps) { const { id } = await params; return <AddressEditorScreen addressId={id} />; }

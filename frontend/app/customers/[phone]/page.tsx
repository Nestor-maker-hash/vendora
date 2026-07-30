import AuthGuard from "@/src/components/AuthGuard";
import DashboardLayout from "@/src/components/layout/DashboardLayout";
import CustomerDetails from "@/src/features/customers/components/CustomerDetails";

interface Props {
  params: Promise<{
    phone: string;
  }>;
}

export default async function CustomerPage({
  params,
}: Props) {
  const { phone } = await params;

  return (
    <AuthGuard>
      <DashboardLayout>
        <CustomerDetails
          phone={decodeURIComponent(phone)}
        />
      </DashboardLayout>
    </AuthGuard>
  );
}

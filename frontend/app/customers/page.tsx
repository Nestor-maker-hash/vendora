import AuthGuard from "@/src/components/AuthGuard";
import DashboardLayout from "@/src/components/layout/DashboardLayout";
import CustomersTable from "@/src/features/customers/components/CustomersTable";

export default function CustomersPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Customers
          </h1>

          <p className="mt-2 text-gray-600">
            Manage your customer relationships.
          </p>
        </div>

        <CustomersTable />
      </DashboardLayout>
    </AuthGuard>
  );
}

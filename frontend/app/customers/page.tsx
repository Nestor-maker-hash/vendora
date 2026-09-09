import AuthGuard from "@/src/components/AuthGuard";
import DashboardLayout from "@/src/components/layout/DashboardLayout";
import CustomersTable from "@/src/features/customers/components/CustomersTable";

export default function CustomersPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="mb-5 sm:mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl">
            Customers
          </h1>

          <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base">
            Manage your customer relationships.
          </p>
        </div>

        <CustomersTable />
      </DashboardLayout>
    </AuthGuard>
  );
}

import StatCard from "@/src/components/dashboard/StatCard";
import DashboardLayout from "@/src/components/layout/DashboardLayout";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold">
        Dashboard
      </h1>

      <p className="mt-2 text-gray-600">
        Welcome to Vendora.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
  <StatCard title="Revenue" value="₦0" />
  <StatCard title="Orders" value="0" />
  <StatCard title="Customers" value="0" />
  <StatCard title="Products" value="0" />
</div>
    </DashboardLayout>
  );
}

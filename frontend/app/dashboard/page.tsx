import AuthGuard from "@/src/components/AuthGuard";
import RecentOrders from "@/src/components/dashboard/RecentOrders";
import StatCard from "@/src/components/dashboard/StatCard";
import DashboardLayout from "@/src/components/layout/DashboardLayout";
import StoreLinkCard from "@/src/features/business/components/StoreLinkCard";
import DashboardStats from "@/src/components/dashboard/DashboardStats";

export default function DashboardPage() {
  return (
	 <AuthGuard>
    <DashboardLayout>
      <h1 className="text-3xl font-bold">
        Dashboard
      </h1>

      <p className="mt-2 text-gray-600">
        Welcome to Vendora.
      </p>

<DashboardStats />

<StoreLinkCard />
<RecentOrders />
    </DashboardLayout>
	  </AuthGuard>
  );
}

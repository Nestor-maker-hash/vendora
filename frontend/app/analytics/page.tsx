import AuthGuard from "@/src/components/AuthGuard";
import DashboardLayout from "@/src/components/layout/DashboardLayout";
import AnalyticsOverview from "@/src/features/analytics/components/AnalyticsOverview";

export default function AnalyticsPage() {
  return (
    <AuthGuard>
      <DashboardLayout>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Analytics
          </h1>

          <p className="mt-2 text-gray-500">
            Monitor your business performance.
          </p>
        </div>

        <AnalyticsOverview />

      </DashboardLayout>
    </AuthGuard>
  );
}

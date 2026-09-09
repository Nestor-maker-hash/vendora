import AuthGuard from "@/src/components/AuthGuard";
import DashboardLayout from "@/src/components/layout/DashboardLayout";
import AnalyticsOverview from "@/src/features/analytics/components/AnalyticsOverview";

export default function AnalyticsPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <AnalyticsOverview />
      </DashboardLayout>
    </AuthGuard>
  );
}

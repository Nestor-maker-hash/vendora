import AuthGuard from "@/src/components/AuthGuard";
import DashboardLayout from "@/src/components/layout/DashboardLayout";
import SubscriptionSettings from "@/src/features/settings/components/SubscriptionSettings";

export default function SubscriptionPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Subscription
          </h1>

          <p className="mt-2 text-gray-500">
            Manage your Vendora subscription and billing.
          </p>
        </div>

        <SubscriptionSettings />
      </DashboardLayout>
    </AuthGuard>
  );
}

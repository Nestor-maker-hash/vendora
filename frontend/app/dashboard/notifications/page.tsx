import AuthGuard from "@/src/components/AuthGuard";
import DashboardLayout from "@/src/components/layout/DashboardLayout";
import NotificationsList from "@/src/features/notifications/components/NotificationsList";

export default function NotificationsPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Notifications
          </h1>

          <p className="mt-2 text-gray-500">
            Recent activity from your business.
          </p>
        </div>

        <NotificationsList />
      </DashboardLayout>
    </AuthGuard>
  );
}

import AuthGuard from "@/src/components/AuthGuard";
import DashboardLayout from "@/src/components/layout/DashboardLayout";
import NotificationsList from "@/src/features/notifications/components/NotificationsList";

export default function NotificationsPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="mb-5 sm:mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl">
            Notifications
          </h1>

          <p className="mt-1 text-sm text-gray-500 sm:mt-2 sm:text-base">
            Recent activity from your business.
          </p>
        </div>

        <NotificationsList />
      </DashboardLayout>
    </AuthGuard>
  );
}

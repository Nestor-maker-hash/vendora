import AuthGuard from "@/src/components/AuthGuard";
import DashboardLayout from "@/src/components/layout/DashboardLayout";
import SettingsPage from "@/src/features/settings/components/SettingsPage";

export default function Settings() {
  return (
    <AuthGuard>
      <DashboardLayout>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Settings
          </h1>

          <p className="mt-2 text-gray-500">
            Manage your business preferences.
          </p>
        </div>

        <SettingsPage />

      </DashboardLayout>
    </AuthGuard>
  );
}

import AuthGuard from "@/src/components/AuthGuard";
import DashboardLayout from "@/src/components/layout/DashboardLayout";
import SettingsPage from "@/src/features/settings/components/SettingsPage";

export default function Settings() {
  return (
    <AuthGuard>
      <DashboardLayout>

        <div className="mb-5 sm:mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl">
            Settings
          </h1>

          <p className="mt-1.5 text-sm text-gray-500 sm:mt-2 sm:text-base">
            Manage your business preferences.
          </p>
        </div>

        <SettingsPage />

      </DashboardLayout>
    </AuthGuard>
  );
}

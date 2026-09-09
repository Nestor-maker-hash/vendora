import AuthGuard from "@/src/components/AuthGuard";
import RecentOrders from "@/src/components/dashboard/RecentOrders";
import DashboardLayout from "@/src/components/layout/DashboardLayout";
import StoreLinkCard from "@/src/features/business/components/StoreLinkCard";
import DashboardStats from "@/src/components/dashboard/DashboardStats";
import PostOnboardingSetup from "@/src/features/onboarding/components/PostOnboardingSetup";
import StoreReadyPrompt from "@/src/features/onboarding/components/StoreReadyPrompt";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base">
            Welcome to Vendora.
          </p>

          <DashboardStats />

          <PostOnboardingSetup />


	  <StoreReadyPrompt />


          <StoreLinkCard />

          <RecentOrders />
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}

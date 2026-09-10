import AuthGuard from "@/src/components/AuthGuard";
import RecentOrders from "@/src/components/dashboard/RecentOrders";
import DashboardLayout from "@/src/components/layout/DashboardLayout";
import StoreLinkCard from "@/src/features/business/components/StoreLinkCard";
import DashboardStats from "@/src/components/dashboard/DashboardStats";
import PostOnboardingSetup from "@/src/features/onboarding/components/PostOnboardingSetup";
import StoreReadyPrompt from "@/src/features/onboarding/components/StoreReadyPrompt";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            Dashboard
          </h1>

          <div className="mt-1 flex items-center justify-between gap-3 sm:mt-2">
            <p className="text-sm text-gray-600 sm:text-base">
              Welcome to Vendora.
            </p>

            <Link
              href="/products/new"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
            >
              <Plus size={15} />
              Add product
            </Link>
          </div>

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

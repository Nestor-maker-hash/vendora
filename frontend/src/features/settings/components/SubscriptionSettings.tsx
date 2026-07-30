"use client";

import { useSubscription } from "@/src/features/subscriptions/hooks/useSubscription";

export default function SubscriptionSettings() {
  const { plans, subscription, loading } = useSubscription();

  if (loading) {
    return <p>Loading...</p>;
  }

  const currentPlan = plans.find(
    (plan) => plan.id === subscription?.plan_id
  );

  if (!currentPlan) {
    return (
      <div className="rounded-2xl border bg-white p-6">
        No subscription found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold">Subscription</h2>
        <p className="mt-2 text-gray-500">Manage your Vendora plan.</p>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">{currentPlan.name}</h3>
            <p className="mt-1 text-sm text-gray-500">
              Your current subscription
            </p>
          </div>

          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
            Current Plan
          </span>
        </div>

        <p className="mt-6 text-4xl font-bold">
          {currentPlan.monthly_price === 0
            ? "Free"
            : `₦${currentPlan.monthly_price.toLocaleString()}/month`}
        </p>

        <div className="mt-8 space-y-2 text-sm">
          <p>Storage: {currentPlan.storage_gb} GB</p>
          <p>Staff: {currentPlan.max_staff}</p>
          <p>Analytics: {currentPlan.analytics ? "✔" : "✘"}</p>
          <p>Custom Domain: {currentPlan.custom_domain ? "✔" : "✘"}</p>
          <p>Priority Support: {currentPlan.priority_support ? "✔" : "✘"}</p>
          <p>API Access: {currentPlan.api_access ? "✔" : "✘"}</p>
        </div>

        <button className="mt-8 w-full rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-700">
          Upgrade Plan
        </button>
      </div>
    </div>
  );
}


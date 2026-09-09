"use client";

import { useState } from "react";
import type { BillingCycle } from "@/src/features/subscriptions/services/initializeSubscriptionPayment";
import toast from "react-hot-toast";

import { useSubscription } from "@/src/features/subscriptions/hooks/useSubscription";
import { changeSubscriptionPlan } from "@/src/features/subscriptions/services/changeSubscriptionPlan";
import { useExchangeRate } from "@/src/features/currency/hooks/useExchangeRate";
import { formatSubscriptionPrice } from "@/src/features/subscriptions/utils/formatSubscriptionPrice";

export default function SubscriptionSettings() {
  const {
    plans,
    subscription,
    business,
    currency,
    loading,
  } = useSubscription();

  const [changingPlan, setChangingPlan] =
    useState<string | null>(null);

  const [billingCycle, setBillingCycle] =
    useState<BillingCycle>("monthly");

  const {
    rate: exchangeRate,
    loading: rateLoading,
  } = useExchangeRate(currency);

  function formatPlanPrice(
    canonicalPrice: number
  ) {
    return formatSubscriptionPrice(
      canonicalPrice,
      currency,
      exchangeRate
    );
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!subscription) {
    return (
      <div className="rounded-2xl border bg-white p-6">
        No subscription found.
      </div>
    );
  }

  const currentSubscription = subscription;

  async function handleChangePlan(
    planId: string,
    isFreePlan: boolean
  ) {
    if (!business) {
      toast.error("Business information could not be loaded.");
      return;
    }

    if (planId === currentSubscription.plan_id) {
      return;
    }

    try {
      setChangingPlan(planId);

      if (isFreePlan) {
        await changeSubscriptionPlan(
          currentSubscription.business_id,
          planId
        );

        toast.success(
          "Subscription changed successfully."
        );

        window.location.reload();
        return;
      }

      window.location.href =
        `/subscription/payment/checkout?plan=${encodeURIComponent(
          planId
        )}&billingCycle=${encodeURIComponent(
          billingCycle
        )}`;
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to change subscription."
      );
    } finally {
      setChangingPlan(null);
    }
  }

  return (
    <div className="space-y-5 sm:space-y-8">
      <div>
        <h2 className="text-xl font-bold sm:text-2xl">
          Subscription
        </h2>

        <p className="mt-1.5 text-sm text-gray-500 sm:mt-2">
          Manage your Vendora plan.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <span className="text-xs font-medium text-gray-700 sm:text-sm">
          Billing cycle:
        </span>

        <div className="inline-flex rounded-lg border bg-white p-0.5 sm:rounded-xl sm:p-1">
          <button
            type="button"
            onClick={() =>
              setBillingCycle("monthly")
            }
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition sm:rounded-lg sm:px-4 sm:py-2 sm:text-sm ${
              billingCycle === "monthly"
                ? "bg-emerald-600 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Monthly
          </button>

          <button
            type="button"
            onClick={() =>
              setBillingCycle("yearly")
            }
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition sm:rounded-lg sm:px-4 sm:py-2 sm:text-sm ${
              billingCycle === "yearly"
                ? "bg-emerald-600 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => {
          const isCurrent =
            plan.id === currentSubscription.plan_id;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-xl border bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6 ${
                isCurrent
                  ? "border-emerald-500 ring-2 ring-emerald-100"
                  : "border-gray-200"
              }`}
            >
              {isCurrent && (
                <span className="absolute right-3 top-3 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 sm:right-4 sm:top-4 sm:px-3 sm:text-xs">
                  Current Plan
                </span>
              )}

              <div>
                <h3 className="text-lg font-bold sm:text-xl">
                  {plan.name}
                </h3>

                <p className="mt-1.5 min-h-[40px] text-xs text-gray-500 sm:mt-2 sm:min-h-[48px] sm:text-sm">
                  {plan.description}
                </p>
              </div>

              <div className="mt-4 sm:mt-6">
                <p className="text-2xl font-bold sm:text-3xl">
                  {rateLoading
                    ? "Loading..."
                    : formatPlanPrice(
                        Number(
                          billingCycle === "monthly"
                            ? plan.monthly_price
                            : plan.yearly_price
                        )
                      )}
                </p>

                {plan.monthly_price > 0 && (
                  <p className="text-xs text-gray-500 sm:text-sm">
                    per{" "}
                    {billingCycle === "monthly"
                      ? "month"
                      : "year"}
                  </p>
                )}
              </div>

              <div className="mt-4 flex-1 space-y-2 text-xs text-gray-600 sm:mt-6 sm:space-y-3 sm:text-sm">
                <p>
                  Storage:{" "}
                  <strong>
                    {plan.storage_gb} GB
                  </strong>
                </p>

                <p>
                  Products:{" "}
                  <strong>
                    {plan.max_products ?? "Unlimited"}
                  </strong>
                </p>

                <p>
                  Orders/month:{" "}
                  <strong>
                    {plan.max_orders_per_month ?? "Unlimited"}
                  </strong>
                </p>

                <p>
                  Customers:{" "}
                  <strong>
                    {plan.max_customers ?? "Unlimited"}
                  </strong>
                </p>

                <p>
                  Delivery zones:{" "}
                  <strong>
                    {plan.max_delivery_zones ?? "Unlimited"}
                  </strong>
                </p>

                <p>
                  Staff:{" "}
                  <strong>
                    {plan.max_staff}
                  </strong>
                </p>

                <p>
                  Analytics:{" "}
                  <strong>
                    {plan.analytics ? "Included" : "Not included"}
                  </strong>
                </p>

                <p>
                  Custom domain:{" "}
                  <strong>
                    {plan.custom_domain ? "Included" : "Not included"}
                  </strong>
                </p>

                <p>
                  Priority support:{" "}
                  <strong>
                    {plan.priority_support ? "Included" : "Not included"}
                  </strong>
                </p>

                <p>
                  API access:{" "}
                  <strong>
                    {plan.api_access ? "Included" : "Not included"}
                  </strong>
                </p>
              </div>

              <button
                disabled={
                  isCurrent ||
                  changingPlan !== null
                }
                onClick={() =>
                  handleChangePlan(
                    plan.id,
                    Number(plan.monthly_price) === 0
                  )
                }
                className={`mt-8 w-full rounded-xl px-5 py-3 font-medium transition ${
                  isCurrent
                    ? "cursor-default bg-gray-100 text-gray-500"
                    : "bg-emerald-600 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                }`}
              >
                {isCurrent
                  ? "Current Plan"
                  : changingPlan === plan.id
                    ? "Updating..."
                    : plan.monthly_price === 0
                      ? "Downgrade to Free"
                      : "Upgrade Plan"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}


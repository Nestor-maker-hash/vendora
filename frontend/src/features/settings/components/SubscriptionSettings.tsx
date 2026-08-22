"use client";


import { useEffect, useState } from "react";
import type { BillingCycle } from "@/src/features/subscriptions/services/initializeSubscriptionPayment";
import toast from "react-hot-toast";

import { useSubscription } from "@/src/features/subscriptions/hooks/useSubscription";
import {
  initializeSubscriptionPayment,
} from "@/src/features/subscriptions/services/initializeSubscriptionPayment";
import { changeSubscriptionPlan } from "@/src/features/subscriptions/services/changeSubscriptionPlan";

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

  const [exchangeRate, setExchangeRate] =
    useState(1);

  const [rateLoading, setRateLoading] =
    useState(false);

  useEffect(() => {
    async function loadExchangeRate() {
      if (!currency || currency === "NGN") {
        setExchangeRate(1);
        return;
      }

      try {
        setRateLoading(true);

        const response = await fetch(
          `/api/currency/rates?currency=${encodeURIComponent(
            currency
          )}`,
          {
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ??
              "Failed to load exchange rate."
          );
        }

        setExchangeRate(
          Number(result.rate)
        );
      } catch (error) {
        console.error(
          "Failed to load subscription exchange rate:",
          error
        );

        toast.error(
          "Unable to load current currency conversion."
        );

        setExchangeRate(1);
      } finally {
        setRateLoading(false);
      }
    }

    loadExchangeRate();
  }, [currency]);

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

      const result =
        await initializeSubscriptionPayment({
          businessId: business.id,
          planId,
          billingCycle,
          customerName: business.name,
        });

      window.location.href =
        result.paymentLink;
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

  const currencySymbols: Record<string, string> = {
    NGN: "₦",
    USD: "$",
    GHS: "GH₵",
    KES: "KSh",
  };

  const currencySymbol =
    currencySymbols[currency] ??
    currency;

  function formatPlanPrice(
    canonicalPrice: number
  ) {
    if (canonicalPrice === 0) {
      return "Free";
    }

    const convertedPrice =
      canonicalPrice * exchangeRate;

    return `${currencySymbol}${Number(
      convertedPrice.toFixed(2)
    ).toLocaleString()}`;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">
          Subscription
        </h2>

        <p className="mt-2 text-gray-500">
          Manage your Vendora plan.
        </p>
      </div>


<div className="flex flex-wrap items-center gap-3">
  <span className="text-sm font-medium text-gray-700">
    Billing cycle:
  </span>

  <div className="inline-flex rounded-xl border bg-white p-1">
    <button
      type="button"
      onClick={() =>
        setBillingCycle("monthly")
      }
      className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
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
      className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
        billingCycle === "yearly"
          ? "bg-emerald-600 text-white"
          : "text-gray-600 hover:text-gray-900"
      }`}
    >
      Yearly
    </button>
  </div>
</div>


      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => {
          const isCurrent =
            plan.id === currentSubscription.plan_id;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm ${
                isCurrent
                  ? "border-emerald-500 ring-2 ring-emerald-100"
                  : "border-gray-200"
              }`}
            >
              {isCurrent && (
                <span className="absolute right-4 top-4 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Current Plan
                </span>
              )}

              <div>
                <h3 className="text-xl font-bold">
                  {plan.name}
                </h3>

                <p className="mt-2 min-h-[48px] text-sm text-gray-500">
                  {plan.description}
                </p>
              </div>

              <div className="mt-6">
                <p className="text-3xl font-bold">
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
                  <p className="text-sm text-gray-500">
                    per{" "}
                    {billingCycle === "monthly"
                      ? "month"
                      : "year"}
                  </p>
                )}
              </div>

              <div className="mt-6 flex-1 space-y-3 text-sm text-gray-600">
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


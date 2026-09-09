"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

import { useSubscription } from "@/src/features/subscriptions/hooks/useSubscription";
import {
  initializeSubscriptionPayment,
} from "@/src/features/subscriptions/services/initializeSubscriptionPayment";

function SubscriptionCheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { business, plans, loading } = useSubscription();

  const planId = searchParams.get("plan");
  const billingCycle =
    searchParams.get("billingCycle") === "yearly"
      ? "yearly"
      : "monthly";

  const [processing, setProcessing] = useState(false);

  const selectedPlan =
    plans.find((plan) => plan.id === planId) ?? null;

  useEffect(() => {
    if (!loading && !planId) {
      router.replace("/subscription");
    }
  }, [loading, planId, router]);

  async function continueToFlutterwave() {
    if (!business) {
      toast.error(
        "Business information could not be loaded."
      );
      return;
    }

    if (!selectedPlan) {
      toast.error(
        "The selected subscription plan could not be found."
      );
      return;
    }

    try {
      setProcessing(true);

      const result =
        await initializeSubscriptionPayment({
          businessId: business.id,
          planId: selectedPlan.id,
          billingCycle,
          customerName: business.name,
        });

      if (!result?.paymentLink) {
        throw new Error(
          "Flutterwave did not return a payment link."
        );
      }

      window.location.href =
        result.paymentLink;
    } catch (error) {
      console.error(
        "Initialize subscription payment:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to prepare your payment."
      );

      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />

          <p className="text-sm font-medium text-slate-500">
            Loading checkout...
          </p>
        </div>
      </main>
    );
  }

  if (!selectedPlan || !business) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />

          <p className="text-sm font-medium text-slate-500">
            Preparing your upgrade...
          </p>
        </div>
      </main>
    );
  }

  const price =
    billingCycle === "yearly"
      ? Number(selectedPlan.yearly_price)
      : Number(selectedPlan.monthly_price);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:flex sm:items-center sm:justify-center sm:py-12">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-6 sm:px-8">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={processing}
            className="mb-6 text-sm font-medium text-slate-500 transition hover:text-slate-900 disabled:opacity-50"
          >
            ← Back
          </button>

          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-600">
            Secure checkout
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Confirm your upgrade
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Review your subscription before continuing to
            Flutterwave.
          </p>
        </div>

        <div className="px-5 py-6 sm:px-8 sm:py-8">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Plan
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {selectedPlan.name}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedPlan.description}
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                {billingCycle === "yearly"
                  ? "Yearly"
                  : "Monthly"}
              </span>
            </div>

            <div className="mt-5 border-t border-slate-200 pt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Subscription price
              </p>

              <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                {price}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {billingCycle === "yearly"
                  ? "Billed yearly"
                  : "Billed monthly"}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                🔒
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Secure payment
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Your payment will be processed securely by
                  Flutterwave.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                💳
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Choose your payment method
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Flutterwave will show the payment methods
                  available for your account and region.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                🛡️
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Vendora never handles your card details
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  You'll leave Vendora and complete the payment
                  on Flutterwave's secure checkout.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-7 rounded-2xl bg-emerald-50 px-4 py-4">
            <p className="text-xs leading-5 text-emerald-800">
              By continuing, you'll be redirected to Flutterwave
              to securely complete your subscription payment.
            </p>
          </div>

          <button
            type="button"
            onClick={continueToFlutterwave}
            disabled={processing}
            className="mt-6 w-full rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            {processing
              ? "Preparing Secure Payment..."
              : "Continue to Flutterwave →"}
          </button>

          <button
            type="button"
            onClick={() => router.replace("/subscription")}
            disabled={processing}
            className="mt-3 w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <p className="mt-4 text-center text-[11px] leading-5 text-slate-400">
            Your subscription will only be activated after the
            payment is successfully verified.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function SubscriptionCheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
          <div className="text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />

            <p className="text-sm font-medium text-slate-500">
              Preparing secure checkout...
            </p>
          </div>
        </main>
      }
    >
      <SubscriptionCheckoutContent />
    </Suspense>
  );
}

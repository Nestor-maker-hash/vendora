"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SubscriptionPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const planId = searchParams.get("plan");
  const billingCycle =
    searchParams.get("billingCycle") || "monthly";

  if (!planId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-xl">
            !
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-900">
            Payment session unavailable
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            We could not identify the subscription plan you want
            to upgrade to.
          </p>

          <button
            type="button"
            onClick={() => router.replace("/subscription")}
            className="mt-6 w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Back to Subscription
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:flex sm:items-center sm:justify-center sm:py-12">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-6 sm:px-8 sm:py-7">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-6 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            ← Back
          </button>

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-xl">
              🔒
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-600">
                Secure checkout
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                Upgrade your Vendora plan
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                You're one step away from unlocking more tools
                for your business.
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 py-6 sm:px-8 sm:py-8">
          <div className="rounded-2xl bg-slate-50 p-4 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Selected billing
            </p>

            <div className="mt-2 flex items-center justify-between gap-4">
              <span className="text-sm font-semibold text-slate-900">
                {billingCycle === "yearly"
                  ? "Yearly billing"
                  : "Monthly billing"}
              </span>

              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                Upgrade
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex gap-3">
              <span className="mt-0.5">🔐</span>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Secure payment
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Your payment is handled securely by Flutterwave.
                  Vendora does not store your card details.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="mt-0.5">💳</span>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Multiple payment options
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Choose from the payment methods available to you
                  on the secure Flutterwave checkout.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="mt-0.5">🛡️</span>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Protected checkout
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  You'll be redirected to Flutterwave to complete
                  your payment securely.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-7 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4">
            <p className="text-xs leading-5 text-emerald-800">
              <strong>Almost there.</strong> Click below to continue
              to the secure payment page.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.replace(
                `/subscription/payment/checkout?plan=${encodeURIComponent(
                  planId
                )}&billingCycle=${encodeURIComponent(
                  billingCycle
                )}`
              )
            }
            className="mt-6 w-full rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md"
          >
            Continue to Secure Payment →
          </button>

          <p className="mt-4 text-center text-[11px] leading-5 text-slate-400">
            You'll be redirected to Flutterwave to complete your
            subscription payment.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function SubscriptionPaymentPage() {
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
      <SubscriptionPaymentContent />
    </Suspense>
  );
}

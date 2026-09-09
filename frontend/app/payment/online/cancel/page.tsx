"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function OnlinePaymentCancelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");
  const storeSlug =
    searchParams.get("store")?.trim() || null;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:py-10">
      <div className="mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-lg">
              💳
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-600">
                Payment
              </p>

              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Payment Cancelled
              </h1>
            </div>

          </div>
        </div>

        <div className="p-5 sm:p-6">

          <div className="flex flex-col items-center py-5 text-center">

            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-50">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-2xl font-bold text-amber-600">
                !
              </div>
            </div>

            <h2 className="mt-6 text-lg font-bold text-slate-900">
              Your payment was cancelled
            </h2>

            <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
              No payment was confirmed. Your order has not been marked as paid.
            </p>

          </div>

          <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3">
            <div className="flex gap-3">

              <span className="mt-0.5 text-sm">
                ℹ️
              </span>

              <p className="text-xs leading-5 text-slate-500">
                You can safely try the payment again. Your order is still waiting for payment.
              </p>

            </div>
          </div>

          <div className="mt-6 space-y-3">

            {token && (
              <button
                type="button"
                onClick={() =>
                  router.replace(
                    `/payment/online?token=${encodeURIComponent(token)}&retry=true`
                  )
                }
                className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md"
              >
                Try Payment Again
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                router.replace(
                  storeSlug
                    ? `/store/${encodeURIComponent(storeSlug)}`
                    : "/"
                )
              }
              className="w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Continue Shopping
            </button>

          </div>

          <p className="mt-6 text-center text-[10px] leading-5 text-slate-400">
            Your order remains unpaid until a successful payment is confirmed.
          </p>

        </div>
      </div>
    </main>
  );
}

export default function OnlinePaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
          <p className="text-sm text-slate-500">
            Loading payment status...
          </p>
        </main>
      }
    >
      <OnlinePaymentCancelContent />
    </Suspense>
  );
}

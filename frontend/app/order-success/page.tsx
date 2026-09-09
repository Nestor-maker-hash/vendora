"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function OrderSuccessContent() {
  const searchParams = useSearchParams();

  const orderId =
    searchParams.get("order")?.trim() || null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">

        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl shadow-sm ring-8 ring-emerald-50/50">
          ✓
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Order Placed Successfully
        </h1>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
          Thank you for your order.
          <br />
          The seller has received it and will contact you shortly.
        </p>

        <div className="mt-6 space-y-3">
          <Link
            href="/marketplace"
            className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md"
          >
            Continue Shopping
          </Link>

          {orderId && (
            <Link
              href={`/buyer/orders/${encodeURIComponent(orderId)}`}
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Track This Order
            </Link>
          )}
        </div>

      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}

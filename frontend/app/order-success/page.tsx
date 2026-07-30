"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function OrderSuccessPage() {
const searchParams = useSearchParams();

const storeSlug = searchParams.get("store");

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-lg rounded-2xl bg-white p-10 text-center shadow-sm">

        <div className="mb-6 text-6xl">
          ✅
        </div>

        <h1 className="text-3xl font-semibold text-gray-900">
          Order Placed Successfully
        </h1>

        <p className="mt-4 text-gray-600">
          Thank you for your order.
          <br />
          The seller has received it and will contact you shortly.
        </p>

  <Link
      href={storeSlug ? `/store/${storeSlug}` : "/"}
      className="mt-8 inline-block rounded-xl bg-emerald-600 px-8 py-4 font-medium text-white"
    >
      Continue Shopping
    </Link>

      </div>
    </main>
  );
}

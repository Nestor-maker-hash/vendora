"use client";

import Link from "next/link";
import { useBusiness } from "@/src/features/business/hooks/useBusiness";

export default function StoreLinkCard() {
  const { business, loading } = useBusiness();

  if (loading) {
    return (
      <div className="mt-8 rounded-xl border bg-white p-6 shadow">
        Loading store...
      </div>
    );
  }

  if (!business) {
    return (
      <div className="mt-8 rounded-xl border bg-white p-6 shadow">
        No business found.
      </div>
    );
  }

const storeUrl =
  typeof window !== "undefined"
    ? `${window.location.origin}/store/${business.slug}`
    : `/store/${business.slug}`;


  async function copyLink() {
    await navigator.clipboard.writeText(storeUrl);
    alert("✅ Store link copied!");
  }

  return (
    <div className="mt-8 rounded-xl border bg-white p-6 shadow">
      <h2 className="text-xl font-semibold">
        🌐 Your Store
      </h2>

      <p className="mt-3 break-all rounded-lg bg-gray-100 p-3 text-sm">
        {storeUrl}
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={copyLink}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
        >
          📋 Copy Link
        </button>

        <Link
          href={`/store/${business.slug}`}
          target="_blank"
          className="rounded-lg border px-4 py-2 hover:bg-gray-50"
        >
          🚀 Visit Store
        </Link>
      </div>
    </div>
  );
}

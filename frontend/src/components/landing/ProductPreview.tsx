"use client";

import { useState } from "react";
import DashboardPreview from "./DashboardPreview";
import StorefrontPreview from "./StorefrontPreview";

type Preview = "dashboard" | "storefront";

export default function ProductPreview() {
  const [preview, setPreview] =
    useState<Preview>("dashboard");

  return (
    <div className="mx-auto mt-16 max-w-5xl sm:mt-20">
      <div className="mb-5 flex justify-center">
        <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1">
          <button
            type="button"
            onClick={() => setPreview("dashboard")}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
              preview === "dashboard"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Merchant Dashboard
          </button>

          <button
            type="button"
            onClick={() => setPreview("storefront")}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
              preview === "storefront"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Online Store
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-2 shadow-2xl shadow-gray-200/70 sm:p-3">
        {preview === "dashboard" ? (
          <DashboardPreview />
        ) : (
          <StorefrontPreview />
        )}
      </div>

      <p className="mt-4 text-center text-xs text-gray-400">
        See how Vendora helps you manage your business and sell
        online.
      </p>
    </div>
  );
}

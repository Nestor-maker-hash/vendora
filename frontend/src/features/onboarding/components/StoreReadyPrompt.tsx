"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Store } from "lucide-react";

import {
  getPostOnboardingStatus,
} from "../services/getPostOnboardingStatus";

import {
  acknowledgeStoreReady,
} from "@/src/features/business/services/acknowledgeStoreReady";

export default function StoreReadyPrompt() {
  const [visible, setVisible] = useState(false);

  const [storeUrl, setStoreUrl] =
    useState<string | null>(null);

  useEffect(() => {
    async function checkStoreReady() {
      try {
        const data =
          await getPostOnboardingStatus();

        if (
          !data.setupComplete ||
          data.storeReadyAcknowledged
        ) {
          return;
        }

        if (!data.business.slug) {
          return;
        }

        setStoreUrl(
          `/store/${data.business.slug}`
        );

        setVisible(true);
      } catch (error) {
        console.error(
          "Failed to check store readiness:",
          error
        );
      }
    }

    checkStoreReady();
  }, []);

  async function handleViewStore() {
  if (!storeUrl) return;

  try {
    const data = await getPostOnboardingStatus();

    await acknowledgeStoreReady(data.business.id);

    setVisible(false);

    window.open(storeUrl, "_blank", "noopener,noreferrer");
  } catch (error) {
    console.error(
      "Failed to acknowledge store readiness:",
      error
    );

    // Still let the merchant visit their store
    window.open(storeUrl, "_blank", "noopener,noreferrer");
    setVisible(false);
  }
}

  if (!visible || !storeUrl) {
    return null;
  }

  return (
    <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
          <Store size={24} />
        </div>

        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900">
            🎉 Your store is ready!
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            Your Vendora store is live and ready to receive
            orders.
          </p>
        </div>


<button
  type="button"
  onClick={handleViewStore}
  className="inline-flex shrink-0 items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white transition hover:bg-emerald-700"
>
  View Store
</button>

      </div>
    </div>
  );
}

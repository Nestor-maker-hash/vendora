"use client";

import { useState } from "react";
import { LockKeyhole } from "lucide-react";

interface Props {
  initialLockOverLimitProducts: boolean;
}

export default function ImmortalPlatformSettings({
  initialLockOverLimitProducts,
}: Props) {
  const [
    lockOverLimitProducts,
    setLockOverLimitProducts,
  ] = useState(initialLockOverLimitProducts);

  const [saving, setSaving] = useState(false);

  async function handleToggle() {
    if (saving) return;

    const nextValue =
      !lockOverLimitProducts;

    setLockOverLimitProducts(nextValue);
    setSaving(true);

    try {
      const response = await fetch(
        "/api/immortal/platform-settings",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lock_over_limit_products: nextValue,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ??
            "Failed to update platform settings."
        );
      }

      setLockOverLimitProducts(
        result.settings.lock_over_limit_products
      );
    } catch (error) {
      console.error(error);

      setLockOverLimitProducts(
        !nextValue
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to update platform settings."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mb-8">
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-emerald-400">
              <LockKeyhole size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-white">
                Storefront Product Limits
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                Lock products that exceed a merchant&apos;s
                active subscription product limit. When
                disabled, merchants can continue selling all
                products even when they are over their plan
                limit.
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={lockOverLimitProducts}
            disabled={saving}
            onClick={handleToggle}
            className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ${
              lockOverLimitProducts
                ? "bg-emerald-500"
                : "bg-slate-700"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                lockOverLimitProducts
                  ? "translate-x-6"
                  : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="border-t border-slate-800 px-5 py-3">
          <p className="text-xs text-slate-500">
            {lockOverLimitProducts
              ? "Over-limit products are currently locked from storefront purchases."
              : "Over-limit products are currently available for storefront purchases."}
          </p>
        </div>
      </div>
    </section>
  );
}

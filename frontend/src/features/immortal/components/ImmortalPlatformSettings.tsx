"use client";

import { useState } from "react";
import {
  LockKeyhole,
  Percent,
  Save,
} from "lucide-react";

interface Props {
  initialLockOverLimitProducts: boolean;
  initialVendoraCustomerFeePercentage: number;
  initialMerchantFeePercentage: number;
  initialPlatformCommissionPercentage: number;
  initialPaystackFeeBearer: "customer" | "vendora";
}

export default function ImmortalPlatformSettings({
  initialLockOverLimitProducts,
  initialVendoraCustomerFeePercentage,
  initialMerchantFeePercentage,
  initialPlatformCommissionPercentage,
  initialPaystackFeeBearer,
}: Props) {
  const [
    lockOverLimitProducts,
    setLockOverLimitProducts,
  ] = useState(initialLockOverLimitProducts);

  const [
    vendoraCustomerFeePercentage,
    setVendoraCustomerFeePercentage,
  ] = useState(
    initialVendoraCustomerFeePercentage
  );

  const [
    merchantFeePercentage,
    setMerchantFeePercentage,
  ] = useState(
    initialMerchantFeePercentage
  );

  const [
    platformCommissionPercentage,
    setPlatformCommissionPercentage,
  ] = useState(
    initialPlatformCommissionPercentage
  );

  const [
    paystackFeeBearer,
    setPaystackFeeBearer,
  ] = useState<"customer" | "vendora">(
    initialPaystackFeeBearer
  );

  const [saving, setSaving] = useState(false);
  const [savingFees, setSavingFees] = useState(false);

  async function handleToggle() {
    if (saving || savingFees) return;

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

  async function handleSaveFees() {
    if (savingFees) return;

    if (
      !Number.isFinite(
        vendoraCustomerFeePercentage
      ) ||
      vendoraCustomerFeePercentage < 0 ||
      vendoraCustomerFeePercentage > 100
    ) {
      alert(
        "Customer fee must be between 0 and 100%."
      );
      return;
    }

    if (
      !Number.isFinite(
        merchantFeePercentage
      ) ||
      merchantFeePercentage < 0 ||
      merchantFeePercentage > 100
    ) {
      alert(
        "Merchant fee must be between 0 and 100%."
      );
      return;
    }

    if (
      !Number.isFinite(
        platformCommissionPercentage
      ) ||
      platformCommissionPercentage < 0 ||
      platformCommissionPercentage > 100
    ) {
      alert(
        "Platform commission must be between 0 and 100%."
      );
      return;
    }

    setSavingFees(true);

    try {
      const response = await fetch(
        "/api/immortal/payment-settings",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            vendora_customer_fee_percentage:
              vendoraCustomerFeePercentage,
            merchant_fee_percentage:
              merchantFeePercentage,
            platform_commission_percentage:
              platformCommissionPercentage,
            paystack_fee_bearer:
              paystackFeeBearer,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ??
            "Failed to save payment fees."
        );
      }

      setVendoraCustomerFeePercentage(
        Number(
          result.settings
            .vendora_customer_fee_percentage
        )
      );

      setMerchantFeePercentage(
        Number(
          result.settings
            .merchant_fee_percentage
        )
      );

      setPlatformCommissionPercentage(
        Number(
          result.settings
            .platform_commission_percentage
        )
      );

      setPaystackFeeBearer(
        result.settings.paystack_fee_bearer
      );

      alert("Payment fees saved successfully.");
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to save payment fees."
      );
    } finally {
      setSavingFees(false);
    }
  }

  return (
    <section className="mb-8 space-y-6">
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
            disabled={saving || savingFees}
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

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
        <div className="border-b border-slate-800 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-emerald-400">
              <Percent size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-white">
                Payment Fees
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Configure the fees applied to online payments.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-sm font-medium text-white">
              Customer fee
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Added to the customer&apos;s order payment.
            </p>

            <div className="mt-4 flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={vendoraCustomerFeePercentage}
                onChange={(event) =>
                  setVendoraCustomerFeePercentage(
                    Number(event.target.value)
                  )
                }
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-500"
              />

              <span className="text-sm font-semibold text-slate-400">
                %
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-sm font-medium text-white">
              Merchant fee
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Used when configuring the merchant&apos;s Paystack
              settlement account.
            </p>

            <div className="mt-4 flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={merchantFeePercentage}
                onChange={(event) =>
                  setMerchantFeePercentage(
                    Number(event.target.value)
                  )
                }
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-500"
              />

              <span className="text-sm font-semibold text-slate-400">
                %
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-sm font-medium text-white">
              Platform commission
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Added to the merchant&apos;s product price when
              customers purchase through Vendora.
            </p>

            <div className="mt-4 flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={platformCommissionPercentage}
                onChange={(event) =>
                  setPlatformCommissionPercentage(
                    Number(event.target.value)
                  )
                }
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-500"
              />

              <span className="text-sm font-semibold text-slate-400">
                %
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-sm font-medium text-white">
              Paystack processing fee
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Choose who pays Paystack&apos;s transaction processing fee.
            </p>

            <select
              value={paystackFeeBearer}
              onChange={(event) =>
                setPaystackFeeBearer(
                  event.target.value as "customer" | "vendora"
                )
              }
              className="mt-4 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
            >
              <option value="customer">
                Customer pays
              </option>
              <option value="vendora">
                Vendora pays
              </option>
            </select>

            <p className="mt-2 text-[11px] leading-4 text-slate-600">
              Customer pays: the Paystack fee is added to the payment.
              Vendora pays: the fee is absorbed by Vendora.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            These settings control how Vendora charges online
            payments.
          </p>

          <button
            type="button"
            onClick={handleSaveFees}
            disabled={savingFees || saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={16} />

            {savingFees
              ? "Saving..."
              : "Save Payment Fees"}
          </button>
        </div>
      </div>
    </section>
  );
}

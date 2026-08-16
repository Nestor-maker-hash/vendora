"use client";

import { useEffect, useState } from "react";
import { useBusiness } from "@/src/features/business/hooks/useBusiness";
import { updateBusiness } from "@/src/features/business/services/updateBusiness";
import toast from "react-hot-toast";

export default function PaymentSettings() {
  const { business, loading } = useBusiness();

  const [currency, setCurrency] = useState("");
  const [payOnDeliveryEnabled, setPayOnDeliveryEnabled] =
    useState(false);
  const [bankTransferEnabled, setBankTransferEnabled] =
    useState(false);
  const [onlinePaymentEnabled, setOnlinePaymentEnabled] =
    useState(false);

  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!business) return;

    setCurrency(business.currency ?? "");
    setPayOnDeliveryEnabled(
      business.pay_on_delivery_enabled ?? false
    );
    setBankTransferEnabled(
      business.bank_transfer_enabled ?? false
    );
    setOnlinePaymentEnabled(
      business.online_payment_enabled ?? false
    );

    setBankName(business.bank_name ?? "");
    setAccountName(business.account_name ?? "");
    setAccountNumber(business.account_number ?? "");
  }, [business]);

  async function handleSave() {
    if (!business) return;

    if (!currency.trim()) {
      toast.error("Please select a currency.");
      return;
    }

    if (
      bankTransferEnabled &&
      (!bankName.trim() ||
        !accountName.trim() ||
        !accountNumber.trim())
    ) {
      toast.error(
        "Please complete your bank account details."
      );
      return;
    }

    try {
      setSaving(true);

      await updateBusiness({
        id: business.id,
        name: business.name,
        slug: business.slug,
        currency,
        pay_on_delivery_enabled: payOnDeliveryEnabled,
        bank_transfer_enabled: bankTransferEnabled,
        online_payment_enabled: onlinePaymentEnabled,
        bank_name: bankName,
        account_name: accountName,
        account_number: accountNumber,
      });

      toast.success("Payment settings saved");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save payment settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!business) {
    return (
      <p className="text-gray-500">
        Business information could not be loaded.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">
          Payment Settings
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Choose how customers can pay for orders from your
          storefront.
        </p>

        <div className="mt-6 space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Currency
            </label>

            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              disabled={saving}
              className="w-full rounded-xl border p-3"
            >
              <option value="">
                Select currency
              </option>
              <option value="NGN">
                Nigerian Naira (NGN)
              </option>
              <option value="USD">
                US Dollar (USD)
              </option>
              <option value="GBP">
                British Pound (GBP)
              </option>
              <option value="EUR">
                Euro (EUR)
              </option>
            </select>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold">
              Payment Methods
            </h3>

            <div className="mt-4 space-y-5">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={payOnDeliveryEnabled}
                  onChange={(e) =>
                    setPayOnDeliveryEnabled(
                      e.target.checked
                    )
                  }
                  disabled={saving}
                />

                <span>
                  Enable Pay on Delivery
                </span>
              </label>

              <div>
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={bankTransferEnabled}
                    onChange={(e) =>
                      setBankTransferEnabled(
                        e.target.checked
                      )
                    }
                    disabled={saving}
                  />

                  <span>
                    Enable Bank Transfer
                  </span>
                </label>

                {bankTransferEnabled && (
                  <div className="mt-4 space-y-3 rounded-xl border bg-slate-50 p-4">
                    <p className="text-sm text-gray-500">
                      Customers will see these details when
                      they choose bank transfer.
                    </p>

                    <input
                      value={bankName}
                      onChange={(e) =>
                        setBankName(e.target.value)
                      }
                      placeholder="Bank Name"
                      disabled={saving}
                      className="w-full rounded-xl border p-3"
                    />

                    <input
                      value={accountName}
                      onChange={(e) =>
                        setAccountName(e.target.value)
                      }
                      placeholder="Account Name"
                      disabled={saving}
                      className="w-full rounded-xl border p-3"
                    />

                    <input
                      value={accountNumber}
                      onChange={(e) =>
                        setAccountNumber(e.target.value)
                      }
                      placeholder="Account Number"
                      inputMode="numeric"
                      disabled={saving}
                      className="w-full rounded-xl border p-3"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={onlinePaymentEnabled}
                    onChange={(e) =>
                      setOnlinePaymentEnabled(
                        e.target.checked
                      )
                    }
                    disabled={saving}
                  />

                  <span>
                    Enable Online Payment
                  </span>
                </label>

                <p className="mt-2 ml-7 text-sm text-gray-500">
                  Online payments will use Paystack after
                  integration.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white transition-opacity hover:bg-emerald-700 disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save Payment Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}

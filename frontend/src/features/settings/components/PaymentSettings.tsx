"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useBusiness } from "@/src/features/business/hooks/useBusiness";
import { updateBusiness } from "@/src/features/business/services/updateBusiness";
import toast from "react-hot-toast";

interface PaystackBank {
  name: string;
  code: string;
}

export default function PaymentSettings() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSetupFlow = searchParams.get("setup") === "true";

  const { business, loading } = useBusiness();

  const [currency, setCurrency] = useState("");
  const [payOnDeliveryEnabled, setPayOnDeliveryEnabled] =
    useState(false);
  const [onlinePaymentEnabled, setOnlinePaymentEnabled] =
    useState(false);

  const [paystackBanks, setPaystackBanks] = useState<PaystackBank[]>([]);
  const [paystackBankCode, setPaystackBankCode] = useState("");
  const [paystackBankSearch, setPaystackBankSearch] = useState("");
  const [paystackBankDropdownOpen, setPaystackBankDropdownOpen] =
    useState(false);
  const [paystackAccountNumber, setPaystackAccountNumber] = useState("");
  const [loadingPaystackBanks, setLoadingPaystackBanks] = useState(false);
  const [connectingPaystack, setConnectingPaystack] = useState(false);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!business) return;

    setCurrency(business.currency ?? "");
    setPayOnDeliveryEnabled(
      business.pay_on_delivery_enabled ?? false
    );
    setOnlinePaymentEnabled(
      business.online_payment_enabled ?? false
    );


    setPaystackBankCode(
      business.paystack_bank_code ?? ""
    );
  }, [business]);

  useEffect(() => {
    let cancelled = false;

    async function loadPaystackBanks() {
      try {
        setLoadingPaystackBanks(true);

        const response = await fetch(
          "/api/paystack/banks",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ??
              "Failed to load Paystack banks."
          );
        }

        if (!cancelled) {
          setPaystackBanks(
            Array.isArray(result.banks)
              ? result.banks
              : []
          );
        }
      } catch (error) {
        console.error(
          "Failed to load Paystack banks:",
          error
        );
      } finally {
        if (!cancelled) {
          setLoadingPaystackBanks(false);
        }
      }
    }

    if (business) {
      void loadPaystackBanks();
    }

    return () => {
      cancelled = true;
    };
  }, [business]);

  const uniquePaystackBanks = Array.from(
    new Map(
      paystackBanks.map((bank) => [
        bank.code,
        bank,
      ])
    ).values()
  );

  const filteredPaystackBanks =
    uniquePaystackBanks.filter((bank) =>
      bank.name
        .toLowerCase()
        .includes(
          paystackBankSearch.trim().toLowerCase()
        )
    );

  const selectedPaystackBank =
    uniquePaystackBanks.find(
      (bank) => bank.code === paystackBankCode
    );

  async function handleConnectPaystack() {
    if (!business) return;

    const selectedBankCode =
      paystackBankCode.trim();

    const selectedAccountNumber =
      paystackAccountNumber.trim();

    if (!selectedBankCode) {
      toast.error("Please select your bank.");
      return;
    }

    if (
      !/^\d{6,20}$/.test(
        selectedAccountNumber
      )
    ) {
      toast.error(
        "Please enter a valid account number."
      );
      return;
    }

    try {
      setConnectingPaystack(true);

      const response = await fetch(
        "/api/paystack/connect",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            businessId: business.id,
            bankCode: selectedBankCode,
            accountNumber:
              selectedAccountNumber,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ??
            "Failed to connect Paystack."
        );
      }

      toast.success(
        result.created
          ? "Paystack connected successfully."
          : "Paystack account updated successfully."
      );

      /*
       * Keep the account number only in the local
       * component state. It is not stored in the
       * businesses table by this connection flow.
       */
      setPaystackAccountNumber("");
    } catch (error) {
      console.error(
        "Paystack connection error:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to connect Paystack."
      );
    } finally {
      setConnectingPaystack(false);
    }
  }

  async function handleSave() {
    if (!business) return;

    if (!currency.trim()) {
      toast.error("Please select a currency.");
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
        online_payment_enabled: onlinePaymentEnabled,
      });

      toast.success("Payment settings saved");

      if (isSetupFlow) {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save payment settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-w-0 rounded-xl border bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6">
        <div className="space-y-2">
          <div className="h-6 w-36 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-72 max-w-full animate-pulse rounded bg-gray-100" />
        </div>

        <div className="mt-5 space-y-5 sm:mt-6 sm:space-y-6">
          <div className="space-y-2">
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
            <div className="h-11 w-full animate-pulse rounded-xl bg-gray-100" />
          </div>

          <div className="border-t pt-5 sm:pt-6">
            <div className="h-5 w-36 animate-pulse rounded bg-gray-200" />

            <div className="mt-4 space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="h-4 w-4 shrink-0 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-40 max-w-full animate-pulse rounded bg-gray-100" />
                </div>
              ))}
            </div>
          </div>

          <div className="h-11 w-40 animate-pulse rounded-xl bg-gray-200" />
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <p className="text-gray-500">
        Business information could not be loaded.
      </p>
    );
  }

  return (
    <div className="min-w-0 space-y-4 sm:space-y-6">
      <div className="min-w-0 rounded-xl border bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6">
        <h2 className="text-lg font-semibold sm:text-xl">
          Payment Settings
        </h2>

        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
          Choose how customers can pay for orders from your
          storefront.
        </p>

        <div className="mt-4 space-y-4 sm:mt-6 sm:space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Currency
            </label>

            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              disabled={saving}
              className="block w-full min-w-0 rounded-xl border p-2.5 text-sm sm:p-3 sm:text-base"
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

          <div className="border-t pt-4 sm:pt-6">
            <h3 className="text-base font-semibold sm:text-lg">
              Payment Methods
            </h3>

            <div className="mt-3 space-y-4 sm:mt-4 sm:space-y-5">
              <label className="flex min-w-0 cursor-pointer items-start gap-2 sm:items-center sm:gap-3">
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
                <label className="flex min-w-0 cursor-pointer items-start gap-2 sm:items-center sm:gap-3">
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

                <div className="mt-3 ml-6 min-w-0 rounded-xl border bg-slate-50 p-3 sm:ml-7 sm:mt-4 sm:p-4">
                  <p className="text-sm font-medium text-gray-700">
                    Connect your Paystack account
                  </p>

                  <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                    Connect the bank account where your
                    Paystack settlements should be sent.
                  </p>

                  <div className="mt-3 space-y-3">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setPaystackBankDropdownOpen(
                            (open) => !open
                          )
                        }
                        disabled={
                          saving ||
                          connectingPaystack ||
                          loadingPaystackBanks
                        }
                        className="flex w-full min-w-0 items-center justify-between rounded-xl border bg-white p-2.5 text-left text-sm sm:p-3 sm:text-base"
                      >
                        <span
                          className={
                            selectedPaystackBank
                              ? "text-gray-900"
                              : "text-gray-500"
                          }
                        >
                          {loadingPaystackBanks
                            ? "Loading banks..."
                            : selectedPaystackBank?.name ??
                              "Select your bank"}
                        </span>

                        <span className="ml-3 shrink-0 text-gray-400">
                          {paystackBankDropdownOpen
                            ? "▲"
                            : "▼"}
                        </span>
                      </button>

                      {paystackBankDropdownOpen &&
                        !loadingPaystackBanks && (
                          <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border bg-white shadow-lg">
                            <div className="border-b p-2">
                              <input
                                type="text"
                                value={paystackBankSearch}
                                onChange={(e) =>
                                  setPaystackBankSearch(
                                    e.target.value
                                  )
                                }
                                placeholder="Search your bank..."
                                autoFocus
                                className="block w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-400"
                              />
                            </div>

                            <div className="max-h-64 overflow-y-auto p-1">
                              {filteredPaystackBanks.length > 0 ? (
                                filteredPaystackBanks.map(
                                  (bank) => (
                                    <button
                                      key={bank.code}
                                      type="button"
                                      onClick={() => {
                                        setPaystackBankCode(
                                          bank.code
                                        );
                                        setPaystackBankSearch(
                                          ""
                                        );
                                        setPaystackBankDropdownOpen(
                                          false
                                        );
                                      }}
                                      className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm hover:bg-gray-100 ${
                                        paystackBankCode ===
                                        bank.code
                                          ? "bg-gray-100 font-medium"
                                          : ""
                                      }`}
                                    >
                                      {bank.name}
                                    </button>
                                  )
                                )
                              ) : (
                                <p className="px-3 py-3 text-sm text-gray-500">
                                  No bank found.
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                    </div>

                    <input
                      value={paystackAccountNumber}
                      onChange={(e) =>
                        setPaystackAccountNumber(
                          e.target.value.replace(
                            /\D/g,
                            ""
                          )
                        )
                      }
                      placeholder="Settlement Account Number"
                      inputMode="numeric"
                      maxLength={20}
                      disabled={
                        saving ||
                        connectingPaystack
                      }
                      className="block w-full min-w-0 rounded-xl border bg-white p-2.5 text-sm sm:p-3 sm:text-base"
                    />

                    <button
                      type="button"
                      onClick={handleConnectPaystack}
                      disabled={
                        saving ||
                        connectingPaystack ||
                        loadingPaystackBanks
                      }
                      className="w-full rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto"
                    >
                      {connectingPaystack
                        ? "Connecting..."
                        : business.paystack_connected
                          ? "Update Paystack"
                          : "Connect Paystack"}
                    </button>

                    {business.paystack_connected && (
                      <p className="text-xs font-medium text-emerald-600 sm:text-sm">
                        ✓ Paystack is connected
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white sm:w-auto sm:rounded-xl sm:px-6 sm:py-3 sm:text-base transition-opacity hover:bg-emerald-700 disabled:opacity-50"
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

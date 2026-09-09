"use client";

import { useEffect, useState } from "react";

import AuthGuard from "@/src/components/AuthGuard";
import DashboardLayout from "@/src/components/layout/DashboardLayout";

import { getBusinessOrders } from "@/src/features/orders/services/getBusinessOrders";
import { Order } from "@/src/features/orders/types/order";
import { formatCurrency } from "@/src/utils/formatCurrency";
import Link from "next/link";
import { useBusiness } from "@/src/features/business/hooks/useBusiness";
import {
  getSubscriptionPayments,
  SubscriptionPayment,
} from "@/src/features/subscriptions/services/getSubscriptionPayments";

export default function PaymentsPage() {
  const [transactions, setTransactions] = useState<Order[]>([]);
  const [transactionsLoading, setTransactionsLoading] =
    useState(false);

  const [subscriptionPayments, setSubscriptionPayments] =
    useState<SubscriptionPayment[]>([]);
  const [subscriptionLoading, setSubscriptionLoading] =
    useState(false);

  const [section, setSection] = useState<
    | "Transactions"
    | "Payment Methods"
    | "Subscription Payments"
  >("Transactions");

  const { business } = useBusiness();

  useEffect(() => {
    if (section !== "Transactions") {
      return;
    }

    let active = true;

    async function loadTransactions() {
      try {
        setTransactionsLoading(true);

        const data = await getBusinessOrders({
          limit: 100,
        });

        if (active) {
          setTransactions(data);
        }
      } catch (err) {
        console.error(
          "Transactions loading error:",
          err
        );
      } finally {
        if (active) {
          setTransactionsLoading(false);
        }
      }
    }

    loadTransactions();

    return () => {
      active = false;
    };
  }, [section]);

  useEffect(() => {
    if (section !== "Subscription Payments" || !business) {
      return;
    }

    let active = true;

    async function loadSubscriptionPayments() {
      if (!business) {
        return;
      }

      try {
        setSubscriptionLoading(true);

        const data = await getSubscriptionPayments(
          business.id
        );

        if (active) {
          setSubscriptionPayments(data);
        }
      } catch (err) {
        console.error(
          "Subscription payments loading error:",
          err
        );
      } finally {
        if (active) {
          setSubscriptionLoading(false);
        }
      }
    }

    loadSubscriptionPayments();

    return () => {
      active = false;
    };
  }, [section, business]);

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-8">

          <div className="min-w-0">
            <h1 className="text-2xl font-bold sm:text-3xl">
              Payments
            </h1>

            <p className="mt-1 text-xs text-gray-500 sm:mt-2 sm:text-sm">
              Manage customer payments and payment methods.
            </p>

            <div className="mt-4 min-w-0 overflow-hidden rounded-xl border bg-white p-2 shadow-sm sm:mt-5 sm:rounded-2xl sm:p-2.5">
              <div className="flex min-w-0 gap-1.5 overflow-x-auto pb-0.5">
                {[
                  "Transactions",
                  "Payment Methods",
                  "Subscription Payments",
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setSection(
                        item as
                          | "Transactions"
                          | "Payment Methods"
                          | "Subscription Payments"
                      )
                    }
                    className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition sm:px-4 sm:py-2.5 sm:text-sm ${
                      section === item
                        ? "bg-emerald-600 text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {section === "Transactions" && (
            <div className="min-w-0 overflow-hidden rounded-xl border bg-white shadow-sm sm:rounded-2xl">
              <div className="border-b p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold sm:text-xl">
                      Transactions
                    </h2>

                    <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                      Payment history for your customer orders.
                    </p>
                  </div>

                  {transactions.length > 0 && (
                    <div className="rounded-lg bg-gray-50 px-3 py-2 sm:rounded-xl sm:px-4">
                      <p className="text-[10px] font-medium text-gray-500 sm:text-xs">
                        Transactions
                      </p>

                      <p className="mt-0.5 text-sm font-semibold text-gray-900 sm:text-base">
                        {transactions.length}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {transactionsLoading ? (
                <div className="divide-y">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex flex-col gap-4 p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
                        <div className="h-3 w-52 max-w-full animate-pulse rounded bg-gray-100" />
                        <div className="h-3 w-64 max-w-full animate-pulse rounded bg-gray-100" />
                      </div>

                      <div className="space-y-2 lg:w-40">
                        <div className="h-5 w-24 animate-pulse rounded bg-gray-200 lg:ml-auto" />
                        <div className="h-3 w-20 animate-pulse rounded bg-gray-100 lg:ml-auto" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : transactions.length === 0 ? (
                <div className="flex min-h-56 flex-col items-center justify-center p-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl">
                    ₦
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-gray-900 sm:text-base">
                    No transactions yet
                  </h3>

                  <p className="mt-1 max-w-sm text-xs text-gray-500 sm:text-sm">
                    Customer payment activity will appear here
                    once orders are created.
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {transactions.map((transaction) => {
                    const status =
                      transaction.payment_status?.toLowerCase() ??
                      "pending";

                    const statusClass =
                      status === "paid"
                        ? "bg-emerald-50 text-emerald-700"
                        : status === "pending"
                          ? "bg-orange-50 text-orange-700"
                          : status === "failed"
                            ? "bg-red-50 text-red-700"
                            : status === "refunded"
                              ? "bg-purple-50 text-purple-700"
                              : "bg-gray-100 text-gray-600";

                    const statusLabel =
                      status === "paid"
                        ? "Paid"
                        : status === "pending"
                          ? "Pending"
                          : status === "failed"
                            ? "Failed"
                            : status === "refunded"
                              ? "Refunded"
                              : status.charAt(0).toUpperCase() +
                                status.slice(1);

                    const methodLabel =
                      transaction.payment_method ===
                      "online_payment"
                        ? "Online Payment"
                        : "Pay on Delivery";

                    const date =
                      transaction.paid_at ??
                      transaction.payment_submitted_at ??
                      transaction.created_at;

                    return (
                      <div
                        key={transaction.id}
                        className="min-w-0 p-4 transition hover:bg-gray-50 sm:p-6"
                      >
                        <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div className="min-w-0">
                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                              <h3 className="truncate text-sm font-semibold text-gray-900 sm:text-base">
                                {transaction.customer_name}
                              </h3>

                              <span
                                className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold sm:px-2.5 sm:py-1 sm:text-[10px] ${statusClass}`}
                              >
                                {statusLabel}
                              </span>
                            </div>

                            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-gray-500 sm:text-xs">
                              <span>
                                {methodLabel}
                              </span>

                              <span className="text-gray-300">
                                •
                              </span>

                              <span>
                                {new Date(date).toLocaleDateString(
                                  undefined,
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )}
                              </span>

                              <span className="text-gray-300">
                                •
                              </span>

                              <span className="truncate">
                                {transaction.customer_phone}
                              </span>
                            </div>

                            {transaction.payment_reference && (
                              <div className="mt-2 max-w-full">
                                <p className="text-[9px] font-medium uppercase tracking-wide text-gray-400 sm:text-[10px]">
                                  Payment reference
                                </p>

                                <p className="mt-0.5 max-w-full break-all font-mono text-[10px] text-gray-500 sm:text-xs">
                                  {transaction.payment_reference}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="shrink-0 border-t pt-3 lg:border-t-0 lg:pt-0 lg:text-right">
                            <p className="text-base font-bold text-gray-900 sm:text-lg">
                              {formatCurrency(
                                Number(transaction.total),
                                transaction.business.currency
                              )}
                            </p>

                            <p className="mt-1 text-[10px] text-gray-500 sm:text-xs">
                              Order payment
                            </p>

                            <Link
                              href={`/dashboard/orders/${transaction.id}`}
                              className="mt-3 inline-flex rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-emerald-700 sm:px-4 sm:py-2 sm:text-sm"
                            >
                              View Order
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {section === "Payment Methods" && (
            <div className="min-w-0 overflow-hidden rounded-xl border bg-white shadow-sm sm:rounded-2xl">
              <div className="border-b p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold sm:text-xl">
                      Payment Methods
                    </h2>

                    <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                      Payment options currently available to customers
                      on your storefront.
                    </p>
                  </div>

                  <Link
                    href="/dashboard/settings"
                    className="inline-flex shrink-0 items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50 sm:px-4 sm:py-2.5 sm:text-sm"
                  >
                    Manage Settings
                  </Link>
                </div>
              </div>

              {!business ? (
                <div className="p-8 text-center text-sm text-gray-500">
                  Business payment settings could not be loaded.
                </div>
              ) : (
                <div className="divide-y">
                  <div className="flex min-w-0 flex-col gap-4 p-4 sm:p-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-sm font-semibold text-emerald-700">
                        POD
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 sm:text-base">
                          Pay on Delivery
                        </h3>

                        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                          Customers can pay when their order is delivered.
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex w-fit shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold sm:text-xs ${
                        business.pay_on_delivery_enabled
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {business.pay_on_delivery_enabled
                        ? "Enabled"
                        : "Disabled"}
                    </span>
                  </div>

                  <div className="flex min-w-0 flex-col gap-4 p-4 sm:p-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-xs font-bold text-purple-700">
                        PAY
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold text-gray-900 sm:text-base">
                            Online Payment
                          </h3>

                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold sm:text-xs ${
                              business.online_payment_enabled
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {business.online_payment_enabled
                              ? "Enabled"
                              : "Disabled"}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                          Customers can pay online through the configured
                          payment provider.
                        </p>

                        {business.online_payment_enabled && (
                          <p className="mt-2 text-[10px] text-gray-400 sm:text-xs">
                            Provider: Paystack
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t bg-gray-50 p-4 sm:p-5">
                <p className="text-xs leading-5 text-gray-500 sm:text-sm">
                  Payment methods are managed from your Payment Settings.
                  Changes made there will automatically apply to your
                  storefront.
                </p>
              </div>
            </div>
          )}

          {section === "Subscription Payments" && (
            <div className="min-w-0 overflow-hidden rounded-xl border bg-white shadow-sm sm:rounded-2xl">
              <div className="border-b p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold sm:text-xl">
                      Subscription Payments
                    </h2>

                    <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                      Your Vendora subscription billing history.
                    </p>
                  </div>

                  {subscriptionPayments.length > 0 && (
                    <div className="rounded-lg bg-gray-50 px-3 py-2 sm:rounded-xl sm:px-4">
                      <p className="text-[10px] font-medium text-gray-500 sm:text-xs">
                        Payments
                      </p>

                      <p className="mt-0.5 text-sm font-semibold text-gray-900 sm:text-base">
                        {subscriptionPayments.length}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {subscriptionLoading ? (
                <div className="divide-y">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                    >
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-5 w-36 animate-pulse rounded bg-gray-200" />
                        <div className="h-3 w-48 max-w-full animate-pulse rounded bg-gray-100" />
                        <div className="h-3 w-64 max-w-full animate-pulse rounded bg-gray-100" />
                      </div>

                      <div className="space-y-2 sm:w-32">
                        <div className="ml-auto h-5 w-24 animate-pulse rounded bg-gray-200" />
                        <div className="ml-auto h-3 w-16 animate-pulse rounded bg-gray-100" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : subscriptionPayments.length === 0 ? (
                <div className="flex min-h-56 flex-col items-center justify-center p-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl">
                    $
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-gray-900 sm:text-base">
                    No subscription payments yet
                  </h3>

                  <p className="mt-1 max-w-sm text-xs text-gray-500 sm:text-sm">
                    Payments for your Vendora subscription will
                    appear here after you complete a billing payment.
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {subscriptionPayments.map((payment) => {
                    const status = payment.status.toLowerCase();

                    const statusClass =
                      status === "paid"
                        ? "bg-emerald-50 text-emerald-700"
                        : status === "pending"
                          ? "bg-orange-50 text-orange-700"
                          : status === "failed"
                            ? "bg-red-50 text-red-700"
                            : status === "cancelled"
                              ? "bg-gray-100 text-gray-600"
                              : "bg-gray-100 text-gray-600";

                    const statusLabel =
                      status === "paid"
                        ? "Paid"
                        : status === "pending"
                          ? "Pending"
                          : status === "failed"
                            ? "Failed"
                            : status === "cancelled"
                              ? "Cancelled"
                              : status.charAt(0).toUpperCase() +
                                status.slice(1);

                    const date = payment.paid_at ?? payment.created_at;

                    return (
                      <div
                        key={payment.id}
                        className="min-w-0 p-4 transition hover:bg-gray-50 sm:p-6"
                      >
                        <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div className="min-w-0">
                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                              <h3 className="truncate text-sm font-semibold text-gray-900 sm:text-base">
                                {payment.subscription_plans?.name ??
                                  "Subscription Plan"}
                              </h3>

                              <span
                                className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold sm:px-2.5 sm:py-1 sm:text-[10px] ${statusClass}`}
                              >
                                {statusLabel}
                              </span>
                            </div>

                            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-gray-500 sm:text-xs">
                              <span>
                                {payment.billing_cycle === "yearly"
                                  ? "Yearly"
                                  : "Monthly"}
                              </span>

                              <span className="text-gray-300">
                                •
                              </span>

                              <span className="capitalize">
                                {payment.provider}
                              </span>

                              <span className="text-gray-300">
                                •
                              </span>

                              <span>
                                {new Date(date).toLocaleDateString(
                                  undefined,
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )}
                              </span>
                            </div>

                            <div className="mt-2 max-w-full">
                              <p className="text-[9px] font-medium uppercase tracking-wide text-gray-400 sm:text-[10px]">
                                Transaction reference
                              </p>

                              <p className="mt-0.5 max-w-full break-all font-mono text-[10px] text-gray-500 sm:text-xs">
                                {payment.transaction_reference}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 border-t pt-3 lg:border-t-0 lg:pt-0 lg:text-right">
                            <p className="text-base font-bold text-gray-900 sm:text-lg">
                              {formatCurrency(
                                Number(payment.amount),
                                payment.currency
                              )}
                            </p>

                            <p className="mt-1 text-[10px] text-gray-500 sm:text-xs">
                              {payment.currency}
                              {" · "}
                              {payment.billing_cycle === "yearly"
                                ? "per year"
                                : "per month"}
                            </p>

                            {payment.paid_at && (
                              <p className="mt-1 text-[10px] text-emerald-600 sm:text-xs">
                                Paid{" "}
                                {new Date(
                                  payment.paid_at
                                ).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}

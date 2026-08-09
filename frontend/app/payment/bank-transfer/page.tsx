"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { getOrderById } from "@/src/features/orders/services/getOrderById";
import { submitBankTransfer } from "@/src/features/orders/services/submitBankTransfer";
import { Order } from "@/src/features/orders/types/order";
import { formatCurrency } from "@/src/utils/formatCurrency";

type BankTransferOrder = Order & {
  business: {
    currency: string;
    bank_name: string | null;
    account_name: string | null;
    account_number: string | null;
  };
};

function BankTransferContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");

  const [order, setOrder] = useState<BankTransferOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const data = (await getOrderById(orderId)) as BankTransferOrder;
        setOrder(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderId]);

  async function copyAccountNumber() {
    if (!order?.business.account_number) return;

    try {
      await navigator.clipboard.writeText(
        order.business.account_number
      );
      toast.success("Account number copied to clipboard!");
    } catch {
      toast.error("Unable to copy account number.");
    }
  }

  async function handlePaymentSubmitted() {
    if (!order) return;

    try {
      setSubmitting(true);

      await submitBankTransfer(order.id);

      toast.success(
        "Payment submitted successfully. The merchant will verify it shortly.",
        {
          duration: 5000,
        }
      );

      setOrder({
        ...order,
        payment_submitted_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error(err);
      toast.error(
        "Failed to submit payment. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        Loading...
      </main>
    );
  }

  if (!order) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        Order not found.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">
          Bank Transfer
        </h1>

        <p className="mt-3 text-gray-600">
          Complete payment using the account below.
        </p>

        <div className="mt-8 space-y-5 rounded-xl border p-5">
          <div>
            <p className="text-sm text-gray-500">Bank</p>
            <p className="font-medium">
              {order.business.bank_name}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Account Name
            </p>
            <p className="font-medium">
              {order.business.account_name}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Account Number
            </p>

            <div className="mt-1 flex items-center justify-between gap-3">
              <p className="font-medium">
                {order.business.account_number}
              </p>

              <button
                type="button"
                onClick={copyAccountNumber}
                className="rounded-lg border px-3 py-1 text-sm font-medium hover:bg-gray-100"
              >
                📋 Copy
              </button>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Amount
            </p>

            <p className="text-2xl font-bold text-emerald-600">
              {formatCurrency(
                Number(order.total),
                order.business.currency
              )}
            </p>
          </div>
        </div>

        <button
          onClick={handlePaymentSubmitted}
          disabled={
            submitting || !!order.payment_submitted_at
          }
          className="mt-8 w-full rounded-xl bg-emerald-600 py-4 font-medium text-white disabled:bg-gray-400"
        >
          {order.payment_submitted_at
            ? "Payment Submitted"
            : submitting
            ? "Submitting..."
            : "I've Made Payment"}
        </button>
      </div>
    </main>
  );
}

export default function BankTransferPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          Loading...
        </main>
      }
    >
      <BankTransferContent />
    </Suspense>
  );
}

"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import { confirmPodPayment } from "../services/confirmPodPayment";
import { Order } from "../types/order";

interface Props {
  order: Order;
}

function formatPaymentMethod(method: Order["payment_method"]) {
  return method.replaceAll("_", " ");
}

function getPaymentState(
  order: Order,
  paid: boolean
) {
  if (paid || order.payment_status === "paid") {
    return {
      label: "Paid",
      className: "text-emerald-600",
    };
  }

  if (order.payment_status === "failed") {
    return {
      label: "Payment Failed",
      className: "text-red-600",
    };
  }

  if (order.payment_status === "refunded") {
    return {
      label: "Refunded",
      className: "text-purple-600",
    };
  }

  if (order.payment_method === "pay_on_delivery") {
    return {
      label: "Payment Due on Delivery",
      className: "text-blue-600",
    };
  }

  return {
    label: "Payment Pending",
    className: "text-orange-600",
  };
}

export default function PaymentVerification({
  order,
}: Props) {
  const [paid, setPaid] = useState(
    order.payment_status === "paid"
  );

  const [loading, setLoading] =
    useState(false);

  const paymentState = getPaymentState(
    order,
    paid
  );

  const canConfirmPodPayment =
    !paid &&
    order.payment_method === "pay_on_delivery" &&
    order.payment_status === "pending" &&
    order.status === "delivered";

  async function handleConfirmPodPayment() {
    try {
      setLoading(true);

      await confirmPodPayment(order.id);

      setPaid(true);

      toast.success(
        "Pay on delivery payment marked as received."
      );
    } catch (err) {
      console.error(err);

      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to confirm payment."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
      <h2 className="mb-4 text-lg font-semibold sm:mb-6 sm:text-xl">
        Payment Information
      </h2>

      <div className="space-y-3 text-sm sm:space-y-4 sm:text-base">
        <div className="flex items-start justify-between gap-4">
          <span>Method</span>

          <span className="text-right font-medium capitalize">
            {formatPaymentMethod(
              order.payment_method
            )}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <span>Status</span>

          <span
            className={`text-right font-semibold ${paymentState.className}`}
          >
            {paymentState.label}
          </span>
        </div>

        {order.payment_submitted_at && (
          <div className="flex items-start justify-between gap-4">
            <span>Customer Submitted</span>

            <span className="text-right">
              {new Date(
                order.payment_submitted_at
              ).toLocaleString()}
            </span>
          </div>
        )}

        {order.paid_at && (
          <div className="flex items-start justify-between gap-4">
            <span>Confirmed</span>

            <span className="text-right">
              {new Date(
                order.paid_at
              ).toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {canConfirmPodPayment && (
        <button
          onClick={handleConfirmPodPayment}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-emerald-600 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-400 sm:mt-8 sm:py-4 sm:text-base"
        >
          {loading
            ? "Confirming..."
            : "Mark Payment as Received"}
        </button>
      )}
    </div>
  );
}

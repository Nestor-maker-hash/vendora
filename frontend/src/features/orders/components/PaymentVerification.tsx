"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import { confirmPayment } from "../services/confirmPayment";
import { Order } from "../types/order";

interface Props {
  order: Order;
}

export default function PaymentVerification({
  order,
}: Props) {
  const [paid, setPaid] = useState(
    order.payment_status === "paid"
  );

  const [loading, setLoading] =
    useState(false);

  async function handleConfirmPayment() {
    try {
      setLoading(true);

      await confirmPayment(order.id);

      setPaid(true);

      toast.success(
        "Payment confirmed successfully."
      );
    } catch (err) {
      console.error(err);

      toast.error(
        "Failed to confirm payment."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">

      <h2 className="mb-6 text-xl font-semibold">
        Payment Information
      </h2>

      <div className="space-y-4">

        <div className="flex justify-between">
          <span>Method</span>

          <span className="font-medium capitalize">
            {order.payment_method.replaceAll(
              "_",
              " "
            )}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Status</span>

          <span
            className={`font-semibold ${
              paid
                ? "text-green-600"
                : "text-orange-600"
            }`}
          >
            {paid
              ? "Paid"
              : "Awaiting Verification"}
          </span>
        </div>

        {order.payment_submitted_at && (
          <div className="flex justify-between">
            <span>Customer Submitted</span>

            <span>
              {new Date(
                order.payment_submitted_at
              ).toLocaleString()}
            </span>
          </div>
        )}

        {order.paid_at && (
          <div className="flex justify-between">
            <span>Confirmed</span>

            <span>
              {new Date(
                order.paid_at
              ).toLocaleString()}
            </span>
          </div>
        )}

      </div>

      {!paid &&
        order.payment_submitted_at && (
          <button
            onClick={handleConfirmPayment}
            disabled={loading}
            className="mt-8 w-full rounded-xl bg-emerald-600 py-4 font-medium text-white disabled:bg-gray-400"
          >
            {loading
              ? "Confirming..."
              : "Confirm Payment"}
          </button>
        )}

    </div>
  );
}

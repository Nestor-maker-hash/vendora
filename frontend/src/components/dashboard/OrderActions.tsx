"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import { updateOrderStatus } from "@/src/features/orders/services/updateOrderStatus";
import type { OrderStatus } from "@/src/features/orders/types/order";

interface Props {
  orderId: string;
  status: string;
}

const actions: Partial<
  Record<
    OrderStatus,
    {
      nextStatus: OrderStatus;
      label: string;
      loadingLabel: string;
      className: string;
    }
  >
> = {
  pending: {
    nextStatus: "confirmed",
    label: "Confirm Order",
    loadingLabel: "Confirming...",
    className: "bg-blue-600 hover:bg-blue-700",
  },
  confirmed: {
    nextStatus: "processing",
    label: "Start Processing",
    loadingLabel: "Starting...",
    className: "bg-indigo-600 hover:bg-indigo-700",
  },
  processing: {
    nextStatus: "shipped",
    label: "Mark as Shipped",
    loadingLabel: "Updating...",
    className: "bg-purple-600 hover:bg-purple-700",
  },
};

export default function OrderActions({
  orderId,
  status,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [pin, setPin] = useState("");
  const [showVerification, setShowVerification] =
    useState(false);

  const normalizedStatus =
    status.toLowerCase() as OrderStatus;

  const action = actions[normalizedStatus];

  async function changeStatus(
    nextStatus: OrderStatus
  ) {
    try {
      setLoading(true);

      const result = await updateOrderStatus(
        orderId,
        nextStatus
      );

      if (nextStatus === "confirmed") {
        if (result.notificationSent) {
          toast.success(
            "Customer has been notified that their order is confirmed."
          );
        } else {
          toast.error(
            "Order confirmed, but we couldn't notify the customer."
          );
        }
      } else {
        toast.success("Order status updated.");
      }

      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update order status."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyDelivery() {
    if (!/^\d{6}$/.test(pin)) {
      toast.error("Enter the 6-digit delivery PIN.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `/api/orders/${orderId}/verify-delivery`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pin,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(
          result.message ??
            "Failed to verify delivery PIN."
        );
        return;
      }

      toast.success("Delivery confirmed.");

      setPin("");
      setShowVerification(false);

      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to verify delivery PIN."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    const confirmed = window.confirm(
      "Cancel this order? This action cannot be undone."
    );

    if (!confirmed) return;

    await changeStatus("cancelled");
  }

  if (normalizedStatus === "delivered") {
    return (
      <div className="rounded-xl bg-emerald-100 px-4 py-3 text-sm font-medium text-emerald-700 sm:px-6 sm:text-base">
        ✓ Order Delivered
      </div>
    );
  }

  if (normalizedStatus === "cancelled") {
    return (
      <div className="rounded-xl bg-red-100 px-4 py-3 text-sm font-medium text-red-700 sm:px-6 sm:text-base">
        Order Cancelled
      </div>
    );
  }

  if (normalizedStatus === "shipped") {
    return (
      <div className="w-full max-w-md">
        {!showVerification ? (
          <button
            type="button"
            onClick={() => setShowVerification(true)}
            disabled={loading}
            className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6 sm:text-base"
          >
            Confirm Delivery
          </button>
        ) : (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:p-5">
            <div>
              <p className="text-sm font-bold text-slate-900 sm:text-base">
                Confirm delivery
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-600 sm:text-sm">
                Ask the buyer for the 6-digit delivery PIN
                and enter it below to confirm that the order
                has been delivered.
              </p>
            </div>

            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              maxLength={6}
              value={pin}
              onChange={(event) =>
                setPin(
                  event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6)
                )
              }
              placeholder="000000"
              aria-label="Delivery PIN"
              className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center font-mono text-xl font-bold tracking-[0.35em] text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />

            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                disabled={loading || pin.length !== 6}
                onClick={handleVerifyDelivery}
                className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Verifying..."
                  : "Verify & Deliver"}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setPin("");
                  setShowVerification(false);
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!action) {
    return (
      <div className="rounded-xl bg-gray-100 px-4 py-3 text-sm font-medium text-gray-600 sm:px-6 sm:text-base">
        Unknown order status
      </div>
    );
  }

  const canCancel =
    normalizedStatus === "pending" ||
    normalizedStatus === "confirmed" ||
    normalizedStatus === "processing";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <button
        type="button"
        disabled={loading}
        onClick={() =>
          changeStatus(action.nextStatus)
        }
        className={`w-full rounded-xl px-4 py-3 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-6 sm:text-base ${action.className}`}
      >
        {loading
          ? action.loadingLabel
          : action.label}
      </button>

      {canCancel && (
        <button
          type="button"
          disabled={loading}
          onClick={handleCancel}
          className="w-full rounded-xl border border-red-200 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-6 sm:text-base"
        >
          Cancel Order
        </button>
      )}
    </div>
  );
}

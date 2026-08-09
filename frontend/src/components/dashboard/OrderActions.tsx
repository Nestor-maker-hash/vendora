"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateOrderStatus } from "@/src/features/orders/services/updateOrderStatus";
import type { OrderStatus } from "@/src/features/orders/types/order";

interface Props {
  orderId: string;
  status: string;
}

export default function OrderActions({
  orderId,
  status,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const normalizedStatus =
    status.toLowerCase() as OrderStatus;

  async function changeStatus(
    nextStatus: OrderStatus
  ) {
    setLoading(true);

    try {
      await updateOrderStatus(
        orderId,
        nextStatus
      );

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (normalizedStatus === "pending") {
    return (
      <button
        disabled={loading}
        onClick={() =>
          changeStatus("confirmed")
        }
        className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white disabled:opacity-50"
      >
        {loading
          ? "Updating..."
          : "Confirm Order"}
      </button>
    );
  }

  if (normalizedStatus === "confirmed") {
    return (
      <button
        disabled={loading}
        onClick={() =>
          changeStatus("shipped")
        }
        className="rounded-xl bg-purple-600 px-6 py-3 font-medium text-white disabled:opacity-50"
      >
        {loading
          ? "Updating..."
          : "Mark as Shipped"}
      </button>
    );
  }

  if (normalizedStatus === "shipped") {
    return (
      <button
        disabled={loading}
        onClick={() =>
          changeStatus("delivered")
        }
        className="rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white disabled:opacity-50"
      >
        {loading
          ? "Updating..."
          : "Mark as Delivered"}
      </button>
    );
  }

  if (normalizedStatus === "delivered") {
    return (
      <div className="rounded-xl bg-emerald-100 px-6 py-3 font-medium text-emerald-700">
        ✓ Order Delivered
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gray-100 px-6 py-3 font-medium text-gray-600">
      Unknown order status
    </div>
  );
}

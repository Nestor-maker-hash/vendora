import type { OrderStatus } from "../types/order";

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
) {
  const response = await fetch(
    `/api/orders/${orderId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ?? "Failed to update order status."
    );
  }
}

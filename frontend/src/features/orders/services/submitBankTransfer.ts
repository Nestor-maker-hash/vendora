import { Order } from "../types/order";

export async function submitBankTransfer(
  token: string
): Promise<Partial<Order>> {
  const response = await fetch(
    `/api/orders/public/${token}/submit-payment`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ??
        "Failed to submit payment."
    );
  }

  return result;
}

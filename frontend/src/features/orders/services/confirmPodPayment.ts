export async function confirmPodPayment(
  orderId: string
) {
  const response = await fetch(
    `/api/orders/${orderId}/confirm-pod-payment`,
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
        "Failed to confirm pay on delivery payment."
    );
  }

  return result;
}

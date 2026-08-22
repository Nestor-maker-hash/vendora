export type BillingCycle =
  | "monthly"
  | "yearly";

interface InitializeSubscriptionPaymentInput {
  businessId: string;
  planId: string;
  billingCycle: BillingCycle;
  customerName?: string;
}

interface InitializeSubscriptionPaymentResult {
  success: true;
  payment: {
    id: string;
    transactionReference: string;
    amount: number;
    currency: string;
    billingCycle: BillingCycle;
  };
  paymentLink: string;
}

export async function initializeSubscriptionPayment(
  input: InitializeSubscriptionPaymentInput
): Promise<InitializeSubscriptionPaymentResult> {
  const response = await fetch(
    "/api/subscriptions/initialize-payment",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ??
        "Failed to initialize subscription payment."
    );
  }

  return result;
}

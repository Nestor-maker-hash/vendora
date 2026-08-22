export type SubscriptionPaymentProvider =
  | "flutterwave";

export type SubscriptionBillingCycle =
  | "monthly"
  | "yearly";

export type SubscriptionPaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "cancelled";

export interface SubscriptionPayment {
  id: string;

  business_id: string;

  plan_id: string;

  provider: SubscriptionPaymentProvider;

  transaction_reference: string;

  provider_transaction_id: string | null;

  amount: number;

  currency: string;

  billing_cycle: SubscriptionBillingCycle;

  status: SubscriptionPaymentStatus;

  paid_at: string | null;

  expires_at: string | null;

  created_at: string;

  updated_at: string;
}

import "server-only";

import { supabaseServer } from "@/src/lib/supabaseServer";

function addMonths(date: Date, months: number) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function addYears(date: Date, years: number) {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

interface ProcessVerifiedSubscriptionPaymentInput {
  transactionId: string;
  transactionReference: string;
  userId?: string;
}

export async function processVerifiedSubscriptionPayment(
  input: ProcessVerifiedSubscriptionPaymentInput
) {
  const {
    transactionId,
    transactionReference,
    userId,
  } = input;

  const { data: payment, error: paymentError } =
    await supabaseServer
      .from("subscription_payments")
      .select(`
        *,
        businesses!inner(
          id,
          owner_id
        )
      `)
    .eq(
  "transaction_reference",
  transactionReference
)
.eq("provider", "flutterwave")
.single();

  if (paymentError || !payment) {
    throw new Error(
      "Subscription payment could not be found."
    );
  }

  const paymentBusiness =
    Array.isArray(payment.businesses)
      ? payment.businesses[0]
      : payment.businesses;

  if (
    userId &&
    (
      !paymentBusiness ||
      paymentBusiness.owner_id !== userId
    )
  ) {
    throw new Error(
      "You do not have permission to verify this payment."
    );
  }

  if (
    payment.status === "pending" &&
    payment.expires_at &&
    new Date(payment.expires_at) < new Date()
  ) {
    await supabaseServer
      .from("subscription_payments")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id)
      .eq("status", "pending");

    throw new Error(
      "This payment session has expired. Please try again."
    );
  }

  if (payment.status === "paid") {
    return {
      alreadyProcessed: true,
      payment,
    };
  }

  if (payment.status !== "pending") {
    throw new Error(
      "This payment session is no longer active. Please start a new payment."
    );
  }

  const flutterwaveSecretKey =
    process.env.FLUTTERWAVE_SECRET_KEY;

  if (!flutterwaveSecretKey) {
    throw new Error(
      "Flutterwave secret key is not configured."
    );
  }

  const flutterwaveResponse = await fetch(
    `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(
      transactionId
    )}/verify`,
    {
      method: "GET",
      headers: {
        Authorization:
          `Bearer ${flutterwaveSecretKey}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  const flutterwaveResult =
    await flutterwaveResponse.json();

  if (
    !flutterwaveResponse.ok ||
    flutterwaveResult.status !== "success"
  ) {
    throw new Error(
      flutterwaveResult.message ??
        "Flutterwave transaction verification failed."
    );
  }

  const transaction =
    flutterwaveResult.data;

  if (transaction.status !== "successful") {
    throw new Error(
      "Payment has not been completed."
    );
  }

  if (
    transaction.tx_ref !==
    payment.transaction_reference
  ) {
    throw new Error(
      "Transaction reference does not match."
    );
  }

  if (
    String(transaction.currency).toUpperCase() !==
    String(payment.currency).toUpperCase()
  ) {
    throw new Error(
      "Payment currency does not match the subscription."
    );
  }

  const expectedAmount =
    Number(payment.amount);

  const paidAmount =
    Number(transaction.amount);

  if (
    !Number.isFinite(expectedAmount) ||
    !Number.isFinite(paidAmount) ||
    paidAmount < expectedAmount
  ) {
    throw new Error(
      "Payment amount does not match the subscription."
    );
  }

  const { data: plan, error: planError } =
    await supabaseServer
      .from("subscription_plans")
      .select("*")
      .eq("id", payment.plan_id)
      .eq("is_active", true)
      .eq("is_public", true)
      .single();

  if (planError || !plan) {
    throw new Error(
      "The subscription plan associated with this payment is unavailable."
    );
  }

  const now = new Date();

  const expiresAt =
    payment.billing_cycle === "yearly"
      ? addYears(now, 1).toISOString()
      : addMonths(now, 1).toISOString();

  const {
    data: claimedPayment,
    error: paymentUpdateError,
  } = await supabaseServer
    .from("subscription_payments")
    .update({
      provider_transaction_id:
        String(transaction.id),
      status: "paid",
      paid_at: now.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq("id", payment.id)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (paymentUpdateError) {
    throw new Error(
      `Failed to update subscription payment: ${paymentUpdateError.message}`
    );
  }

  if (!claimedPayment) {
    return {
      alreadyProcessed: true,
      payment,
    };
  }

  const {
    data: subscription,
    error: subscriptionError,
  } = await supabaseServer
    .from("business_subscriptions")
    .update({
      plan_id: plan.id,
      status: "active",
      started_at: now.toISOString(),
      expires_at: expiresAt,
    })
    .eq("business_id", payment.business_id)
    .select(`
      *,
      subscription_plans (*)
    `)
    .single();

  if (subscriptionError || !subscription) {
    throw new Error(
      subscriptionError?.message ??
        "Payment verified, but subscription activation failed."
    );
  }

  return {
    alreadyProcessed: false,
    subscription,
    payment: {
      id: payment.id,
      transactionReference:
        payment.transaction_reference,
      providerTransactionId:
        String(transaction.id),
      status: "paid",
    },
  };
}

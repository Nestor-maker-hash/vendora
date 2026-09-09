import "server-only";

import { supabaseServer } from "@/src/lib/supabaseServer";
import { notifyMerchant } from "@/src/features/notifications/services/notifyMerchant";
import { Order } from "@/src/features/orders/types/order";

interface ProcessVerifiedOnlinePaymentInput {
  reference: string;
  transaction: any;
}

interface ProcessVerifiedOnlinePaymentResult {
  alreadyPaid: boolean;
  orderId: string;
  storeSlug: string | null;
}

export async function processVerifiedOnlinePayment({
  reference,
  transaction,
}: ProcessVerifiedOnlinePaymentInput): Promise<ProcessVerifiedOnlinePaymentResult> {
  const transactionStatus =
    String(transaction?.status ?? "")
      .trim()
      .toLowerCase();

  if (transactionStatus !== "success") {
    throw new Error(
      "Payment has not been successfully completed."
    );
  }

  const { data: order, error: orderError } =
    await supabaseServer
      .from("orders")
      .select(`
        id,
        public_token,
        business_id,
        total,
        customer_fee,
        payment_method,
        payment_status,
        payment_reference
      `)
      .eq("payment_reference", reference)
      .eq("payment_method", "online_payment")
      .single();

  if (orderError || !order) {
    throw new Error(
      "Matching order could not be found."
    );
  }

  const metadataOrderId = String(
    transaction?.metadata?.order_id ?? ""
  ).trim();

  const metadataBusinessId = String(
    transaction?.metadata?.business_id ?? ""
  ).trim();

  /*
   * Paystack metadata is created by Vendora during payment
   * initialization. Both identifiers are required during
   * verification so a valid Paystack transaction cannot be
   * attached to the wrong order or business.
   *
   * Never trust these values without comparing them against
   * the server-side order retrieved from our database.
   */
  if (!metadataOrderId) {
    throw new Error(
      "Payment is missing required order information."
    );
  }

  if (metadataOrderId !== order.id) {
    throw new Error(
      "Payment order information does not match."
    );
  }

  if (!metadataBusinessId) {
    throw new Error(
      "Payment is missing required business information."
    );
  }

  if (metadataBusinessId !== order.business_id) {
    throw new Error(
      "Payment business information does not match."
    );
  }

  const { data: business, error: businessError } =
    await supabaseServer
      .from("businesses")
      .select("id, name, currency, slug")
      .eq("id", order.business_id)
      .single();

  if (businessError || !business) {
    throw new Error(
      "Business information could not be found."
    );
  }

  /*
   * The customer fee was calculated and snapshotted when
   * the order was created.
   *
   * Never recalculate it from the current platform settings
   * during verification. Existing orders must retain the exact
   * amount they were created with.
   *
   * Never trust fee values returned from the browser.
   */
  const orderAmount =
    Number(order.total);

  if (
    !Number.isFinite(orderAmount) ||
    orderAmount <= 0
  ) {
    throw new Error(
      "Order payment amount is invalid."
    );
  }

  const vendoraCustomerFee =
    Number(order.customer_fee ?? 0);

  if (
    !Number.isFinite(vendoraCustomerFee) ||
    vendoraCustomerFee < 0
  ) {
    throw new Error(
      "Order customer fee is invalid."
    );
  }

  const expectedRequestedAmount =
    Math.round(
      (orderAmount + vendoraCustomerFee) * 100
    );

  /*
   * Paystack's `amount` can include Paystack processing fees
   * charged to the customer, so it may be higher than the
   * amount Vendora requested.
   *
   * The security check must therefore compare Paystack's
   * `requested_amount` against:
   *
   * order total + configurable Vendora customer fee.
   *
   * Paystack's own processing fee remains separate and must
   * not cause a legitimate payment to be rejected.
   */
  const requestedAmount =
    Number(transaction?.requested_amount);

  const paidAmount =
    Number(transaction?.amount);

  const paystackFees =
    Number(transaction?.fees ?? 0);

  if (
    !Number.isFinite(requestedAmount) ||
    requestedAmount <= 0
  ) {
    throw new Error(
      "Paystack returned an invalid requested payment amount."
    );
  }

  if (
    !Number.isFinite(paidAmount) ||
    paidAmount <= 0
  ) {
    throw new Error(
      "Paystack returned an invalid payment amount."
    );
  }

  if (
    !Number.isFinite(paystackFees) ||
    paystackFees < 0
  ) {
    throw new Error(
      "Paystack returned invalid payment fees."
    );
  }

  /*
   * Compare against the amount Vendora actually requested,
   * not the final customer charge which may include Paystack
   * processing fees.
   */
  if (
    requestedAmount !== expectedRequestedAmount
  ) {
    console.error(
      "Payment amount mismatch:",
      {
        reference,
        orderId: order.id,
        expectedAmount: expectedRequestedAmount,
        requestedAmount,
        paidAmount,
        currency: transaction?.currency,
      }
    );

    throw new Error(
      "Payment amount does not match the expected order and platform fee."
    );
  }

  const transactionCurrency =
    String(transaction?.currency ?? "")
      .trim()
      .toUpperCase();

  const expectedCurrency =
    String(business.currency ?? "")
      .trim()
      .toUpperCase();

  if (
    !expectedCurrency ||
    transactionCurrency !== expectedCurrency
  ) {
    throw new Error(
      "Payment currency does not match the expected currency."
    );
  }

  const paidAt =
    transaction?.paid_at ??
    new Date().toISOString();

  /*
   * Finalize the payment and reduce all inventory inside one
   * PostgreSQL transaction.
   *
   * This guarantees that an online order cannot become paid
   * unless every required stock reduction succeeds.
   *
   * If any product has insufficient stock, PostgreSQL rolls back
   * both the stock changes and the pending → paid transition.
   *
   * The RPC also makes the transition idempotent:
   * only the request that changes pending → paid performs the
   * inventory reductions. Duplicate callbacks/webhooks receive
   * false and are treated as already paid.
   */
  const {
    data: finalized,
    error: finalizeError,
  } = await supabaseServer.rpc(
    "finalize_online_order_payment",
    {
      p_order_id: order.id,
      p_business_id: order.business_id,
      p_paid_at: paidAt,
      p_paystack_fee: paystackFees / 100,
      p_paid_amount: paidAmount / 100,
      p_provider_reference: reference,
    }
  );

  if (finalizeError) {
    if (
      finalizeError.message
        .toLowerCase()
        .includes("not enough stock")
    ) {
      throw new Error(
        "Payment was verified, but there is not enough stock available to fulfill this order."
      );
    }

    throw finalizeError;
  }

  if (finalized === false) {
    const {
      data: currentOrder,
      error: currentOrderError,
    } = await supabaseServer
      .from("orders")
      .select("payment_status")
      .eq("id", order.id)
      .eq("business_id", order.business_id)
      .single();

    if (currentOrderError || !currentOrder) {
      throw new Error(
        "Failed to confirm the current payment status."
      );
    }

    if (currentOrder.payment_status === "paid") {
      return {
        alreadyPaid: true,
        orderId: order.id,
        storeSlug:
          business.slug ?? null,
      };
    }

    throw new Error(
      "Order could not be finalized because its payment status changed."
    );
  }

  /*
   * The transaction has committed successfully.
   *
   * Load the now-paid order for merchant notification.
   * Notification failure must NOT undo the successful payment.
   */
  const {
    data: paidOrder,
    error: paidOrderError,
  } = await supabaseServer
    .from("orders")
    .select("*")
    .eq("id", order.id)
    .eq("business_id", order.business_id)
    .single();

  if (paidOrderError || !paidOrder) {
    throw new Error(
      paidOrderError?.message ??
        "Verified order could not be loaded."
    );
  }

  try {
    await notifyMerchant(
      paidOrder as Order,
      business.currency
    );
  } catch (notificationError) {
    console.error(
      "Merchant notification after online payment failed:",
      notificationError
    );
  }

  return {
    alreadyPaid: false,
    orderId: order.id,
    storeSlug:
      business.slug ?? null,
  };
}

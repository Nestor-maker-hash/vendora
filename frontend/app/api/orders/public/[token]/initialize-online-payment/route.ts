import crypto from "crypto";
import { NextResponse } from "next/server";

import { supabaseServer } from "@/src/lib/supabaseServer";

interface RouteContext {
  params: Promise<{
    token: string;
  }>;
}

export async function POST(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { token } = await params;

    const { data: order, error: orderError } =
      await supabaseServer
        .from("orders")
        .select(`
          id,
          business_id,
          total,
          customer_fee,
          customer_email,
          payment_method,
          payment_status,
          payment_reference,
          payment_authorization_url,
          businesses!inner(
            name,
            slug,
            currency,
            online_payment_enabled,
            paystack_transfer_recipient_code
          )
        `)
        .eq("public_token", token)
        .eq("payment_method", "online_payment")
        .single();

    if (orderError || !order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found.",
        },
        { status: 404 }
      );
    }

    if (order.payment_status === "paid") {
      return NextResponse.json(
        {
          success: false,
          message: "This order has already been paid.",
        },
        { status: 400 }
      );
    }

    /*
     * A failed payment may be retried.
     *
     * Reset the order to pending and clear the previous
     * Paystack reference so a completely new payment
     * session is created.
     */
    if (order.payment_status === "failed") {
      const { error: retryError } =
        await supabaseServer
          .from("orders")
          .update({
            payment_status: "pending",
            payment_reference: null,
            payment_authorization_url: null,
            paid_at: null,
          })
          .eq("id", order.id)
          .eq("business_id", order.business_id)
          .eq("payment_status", "failed");

      if (retryError) {
        throw new Error(
          `Failed to prepare payment retry: ${retryError.message}`
        );
      }

      order.payment_status = "pending";
      order.payment_reference = null;
      order.payment_authorization_url = null;
    }

    const business = Array.isArray(order.businesses)
      ? order.businesses[0]
      : order.businesses;

    if (!business) {
      throw new Error(
        "Business information could not be found."
      );
    }

    if (business.online_payment_enabled !== true) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Online payment is not available for this store.",
        },
        { status: 400 }
      );
    }

    const paystackSecretKey =
      process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecretKey) {
      throw new Error(
        "Paystack secret key is not configured."
      );
    }

    const isPaystackTestMode =
      paystackSecretKey.startsWith("sk_test_");

    const paystackTransferRecipientCode =
      String(
        business.paystack_transfer_recipient_code ?? ""
      ).trim();

    /*
     * Vendora intentionally does NOT pass the merchant's
     * Paystack subaccount during checkout.
     *
     * Passing `subaccount` would cause Paystack to split and
     * settle the merchant's share immediately. Vendora's model
     * is different: merchant funds remain under Vendora's
     * control until the delivery PIN is successfully verified.
     *
     * The transfer recipient is therefore the important
     * settlement destination that must exist before a live
     * marketplace payment can be accepted.
     *
     * Test mode does not require a live recipient because
     * Paystack test and live resources are separate.
     */
    if (
      !isPaystackTestMode &&
      !paystackTransferRecipientCode
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This store has not connected a Paystack settlement account yet.",
        },
        { status: 400 }
      );
    }

    const customerEmail =
      String(order.customer_email ?? "").trim();

    if (!customerEmail) {
      return NextResponse.json(
        {
          success: false,
          message:
            "An email address is required for online payment.",
        },
        { status: 400 }
      );
    }

    const amount = Number(order.total);

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      throw new Error(
        "Order payment amount is invalid."
      );
    }

    const currency =
      String(business.currency ?? "")
        .trim()
        .toUpperCase();

    if (!currency) {
      throw new Error(
        "Business payment currency is not configured."
      );
    }

    /*
     * The customer fee was calculated and snapshotted when
     * the order was created.
     *
     * Never recalculate it here from the current platform
     * settings. Platform fee changes must not alter an
     * existing order's payment amount.
     */
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

    const customerPaymentAmount =
      amount + vendoraCustomerFee;

    /*
     * Use the origin of the actual request.
     *
     * This prevents a stale production NEXT_PUBLIC_APP_URL
     * from sending local development payments back to Vercel.
     */
    const appUrl =
      new URL(request.url).origin;

    const callbackUrl =
      `${appUrl}/payment/online/callback`;

    /*
     * A payment session belongs to one order and one Paystack
     * transaction reference.
     *
     * Once Paystack returns an authorization URL, that URL is stored
     * on the order. Duplicate requests can then reuse the exact same
     * Paystack payment session.
     */
    let paymentReference =
      String(order.payment_reference ?? "").trim();

    const existingAuthorizationUrl =
      String(
        order.payment_authorization_url ?? ""
      ).trim();

    /*
     * Fast idempotent path:
     *
     * If this order already has a reference and authorization URL,
     * never initialize another Paystack transaction.
     */
    if (
      paymentReference &&
      existingAuthorizationUrl
    ) {
      return NextResponse.json({
        success: true,
        paymentReference,
        authorizationUrl:
          existingAuthorizationUrl,
      });
    }

    /*
     * Create a reference only when the order does not already have
     * one. The conditional update ensures concurrent requests cannot
     * replace the reference claimed by the first request.
     */
    if (!paymentReference) {
      const newPaymentReference =
        `vendora-${order.id}-${Date.now()}-${crypto
          .randomUUID()
          .slice(0, 8)}`;

      const {
        data: claimedOrder,
        error: claimError,
      } = await supabaseServer
        .from("orders")
        .update({
          payment_reference:
            newPaymentReference,
          payment_status: "pending",
        })
        .eq("id", order.id)
        .eq("business_id", order.business_id)
        .is("payment_reference", null)
        .eq("payment_status", "pending")
        .select(
          "payment_reference, payment_authorization_url"
        )
        .maybeSingle();

      if (claimError) {
        throw new Error(
          `Failed to create payment reference: ${claimError.message}`
        );
      }

      if (claimedOrder?.payment_reference) {
        paymentReference =
          claimedOrder.payment_reference;
      } else {
        /*
         * Another request won the race. Load the winning payment
         * session rather than generating a competing reference.
         */
        const {
          data: existingOrder,
          error: existingOrderError,
        } = await supabaseServer
          .from("orders")
          .select(
            "payment_reference, payment_authorization_url"
          )
          .eq("id", order.id)
          .eq("business_id", order.business_id)
          .single();

        if (
          existingOrderError ||
          !existingOrder?.payment_reference
        ) {
          throw new Error(
            "Failed to confirm payment session."
          );
        }

        paymentReference =
          existingOrder.payment_reference;

        const existingUrl =
          String(
            existingOrder.payment_authorization_url ??
              ""
          ).trim();

        if (existingUrl) {
          return NextResponse.json({
            success: true,
            paymentReference,
            authorizationUrl:
              existingUrl,
          });
        }
      }
    }

    const orderId = order.id;
    const businessId = order.business_id;


    async function initializePaystackTransaction(
      reference: string
    ) {
      const response =
        await fetch(
          "https://api.paystack.co/transaction/initialize",
          {
            method: "POST",
            headers: {
              Authorization:
                `Bearer ${paystackSecretKey}`,
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              email: customerEmail,
              amount: Math.round(
                customerPaymentAmount * 100
              ),
              currency,
              reference,
              callback_url: callbackUrl,

              metadata: {
                order_id: orderId,
                business_id:
                  businessId,
                public_token: token,
                order_total: amount,
                vendora_customer_fee:
                  vendoraCustomerFee,
                customer_payment_amount:
                  customerPaymentAmount,
                transfer_recipient_code:
                  paystackTransferRecipientCode || null,
                business_name:
                  business.name,
                cancel_action:
                  `${appUrl}/payment/online/cancel?token=${encodeURIComponent(token)}&store=${encodeURIComponent(
                    String(business.slug ?? "")
                  )}`,
              },
            }),
          }
        );

      const result =
        await response.json();

      return {
        response,
        result,
      };
    }

    let {
      response: paystackResponse,
      result: paystackResult,
    } = await initializePaystackTransaction(
      paymentReference
    );

    /*
     * Paystack may report a duplicate when another request is
     * initializing the same payment reference at the same time.
     *
     * NEVER replace the order's reference here.
     *
     * Instead, wait for the request that owns the reference to
     * persist its authorization URL, then reuse that session.
     */
    if (
      !paystackResponse.ok &&
      String(
        paystackResult?.message ?? ""
      )
        .toLowerCase()
        .includes("duplicate transaction reference")
    ) {
      for (let attempt = 0; attempt < 10; attempt += 1) {
        const {
          data: existingPaymentSession,
          error: existingPaymentSessionError,
        } = await supabaseServer
          .from("orders")
          .select(
            "payment_reference, payment_authorization_url, payment_status"
          )
          .eq("id", order.id)
          .eq("business_id", order.business_id)
          .single();

        if (
          !existingPaymentSessionError &&
          existingPaymentSession &&
          existingPaymentSession.payment_reference ===
            paymentReference
        ) {
          const existingAuthorizationUrl =
            String(
              existingPaymentSession
                .payment_authorization_url ?? ""
            ).trim();

          if (existingAuthorizationUrl) {
            return NextResponse.json({
              success: true,
              paymentReference,
              authorizationUrl:
                existingAuthorizationUrl,
            });
          }

          if (
            existingPaymentSession.payment_status ===
            "paid"
          ) {
            throw new Error(
              "This order has already been paid."
            );
          }
        }

        await new Promise((resolve) =>
          setTimeout(resolve, 300)
        );
      }

      throw new Error(
        "A payment session is already being prepared. Please try again."
      );
    }

    if (
      !paystackResponse.ok ||
      !paystackResult.status
    ) {
      throw new Error(
        paystackResult.message ??
          "Failed to initialize Paystack payment."
      );
    }

    const authorizationUrl =
      String(
        paystackResult.data?.authorization_url ?? ""
      ).trim();

    if (!authorizationUrl) {
      throw new Error(
        "Paystack did not return a payment link."
      );
    }

    /*
     * Persist the authorization URL against the exact payment
     * reference that was initialized with Paystack.
     *
     * Future duplicate requests can now reuse this same payment
     * session without calling Paystack again.
     */
    const { error: authorizationUrlError } =
      await supabaseServer
        .from("orders")
        .update({
          payment_authorization_url:
            authorizationUrl,
          payment_status: "pending",
        })
        .eq("id", order.id)
        .eq("business_id", order.business_id)
        .eq(
          "payment_reference",
          paymentReference
        )
        .eq("payment_status", "pending");

    if (authorizationUrlError) {
      throw new Error(
        `Failed to save payment session: ${authorizationUrlError.message}`
      );
    }

    return NextResponse.json({
      success: true,
      paymentReference,
      authorizationUrl,
    });
  } catch (error) {
    console.error(
      "Initialize online order payment error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to initialize payment.",
      },
      { status: 500 }
    );
  }
}

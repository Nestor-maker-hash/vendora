import { NextRequest, NextResponse } from "next/server";

import { processVerifiedOnlinePayment } from "@/src/features/orders/services/processVerifiedOnlinePayment.server";

interface RequestBody {
  reference?: string;
}

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      (await request.json()) as RequestBody;

    const reference =
      String(body.reference ?? "").trim();

    if (!reference) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment reference is required.",
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

    /*
     * Never trust the browser callback alone.
     *
     * Verify the exact transaction directly
     * with Paystack.
     */
    const paystackResponse =
      await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(
          reference
        )}`,
        {
          headers: {
            Authorization:
              `Bearer ${paystackSecretKey}`,
          },
        }
      );

    const paystackResult =
      await paystackResponse.json();

    if (
      !paystackResponse.ok ||
      !paystackResult.status
    ) {
      throw new Error(
        paystackResult.message ??
          "Failed to verify payment."
      );
    }

    const transaction =
      paystackResult.data;

    const transactionStatus =
      String(transaction?.status ?? "")
        .trim()
        .toLowerCase();

    /*
     * A definitive Paystack failure marks the
     * corresponding Vendora order as failed.
     */
    if (transactionStatus === "failed") {
      const { data: failedOrder, error: failedOrderError } =
        await (
          await import("@/src/lib/supabaseServer")
        ).supabaseServer
          .from("orders")
          .update({
            payment_status: "failed",
          })
          .eq("payment_reference", reference)
          .eq("payment_method", "online_payment")
          .eq("payment_status", "pending")
          .select(`
            id,
            public_token,
            businesses!inner(
              slug
            )
          `)
          .maybeSingle();

      if (failedOrderError) {
        throw failedOrderError;
      }

      return NextResponse.json(
        {
          success: false,
          paymentFailed: true,
          alreadyFailed: !failedOrder,
          publicToken:
            failedOrder?.public_token ?? null,
          storeSlug:
            failedOrder?.businesses?.[0]?.slug ?? null,
          message: "Payment was not completed.",
        },
        { status: 400 }
      );
    }

    /*
     * The customer abandoned the Paystack checkout.
     *
     * Keep the Vendora order pending so the customer
     * can safely retry with a fresh payment reference.
     */
    if (transactionStatus === "abandoned") {
      const { data: abandonedOrder, error: abandonedOrderError } =
        await (
          await import("@/src/lib/supabaseServer")
        ).supabaseServer
          .from("orders")
          .select(`
            id,
            public_token,
            businesses!inner(
              slug
            )
          `)
          .eq("payment_reference", reference)
          .eq("payment_method", "online_payment")
          .maybeSingle();

      if (abandonedOrderError) {
        throw abandonedOrderError;
      }

      return NextResponse.json(
        {
          success: false,
          paymentCancelled: true,
          publicToken:
            abandonedOrder?.public_token ?? null,
          storeSlug:
            abandonedOrder?.businesses?.[0]?.slug ?? null,
          message: "Payment was cancelled.",
        },
        { status: 400 }
      );
    }

    /*
     * Non-final states must remain pending.
     */
    if (transactionStatus !== "success") {
      const { data: pendingOrder } =
        await (
          await import("@/src/lib/supabaseServer")
        ).supabaseServer
          .from("orders")
          .select(`
            public_token,
            businesses!inner(
              slug
            )
          `)
          .eq("payment_reference", reference)
          .eq("payment_method", "online_payment")
          .maybeSingle();

      return NextResponse.json(
        {
          success: false,
          paymentPending: true,
          publicToken:
            pendingOrder?.public_token ?? null,
          storeSlug:
            pendingOrder?.businesses?.[0]?.slug ?? null,
          message: "Payment is still being processed.",
        },
        { status: 202 }
      );
    }

    /*
     * The shared processor owns:
     *
     * pending → paid
     * stock reduction
     * merchant notification
     *
     * Its atomic pending → paid transition ensures
     * duplicate callbacks/webhooks cannot perform
     * these side effects twice.
     */
    const result =
      await processVerifiedOnlinePayment({
        reference,
        transaction,
      });

    return NextResponse.json({
      success: true,
      alreadyPaid: result.alreadyPaid,
      orderId: result.orderId,
      storeSlug: result.storeSlug,
    });
  } catch (error) {
    console.error(
      "Verify online order payment error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to verify payment.",
      },
      { status: 500 }
    );
  }
}

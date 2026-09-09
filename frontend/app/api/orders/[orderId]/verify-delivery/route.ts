import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerAuthClient } from "@/src/lib/supabaseServerAuth";
import { supabaseServer } from "@/src/lib/supabaseServer";
import {
  initiatePaystackTransfer,
  verifyPaystackTransfer,
} from "@/src/features/orders/services/paystackTransfer.server";
import { createBuyerNotification } from "@/src/features/buyerNotifications/services/createBuyerNotification";
import { BuyerNotificationType } from "@/src/features/buyerNotifications/constants/notificationTypes";

interface RouteContext {
  params: Promise<{
    orderId: string;
  }>;
}

interface SettlementReconciliationResult {
  success?: boolean;
  already_settled?: boolean;
  already_failed?: boolean;
  settlement_status?: string;
  transfer_reference?: string;
  transfer_code?: string | null;
  settlement_error?: string | null;
  message?: string;
}

async function reconcileSettlement(
  orderId: string,
  businessId: string,
  transferReference: string,
  transferCode: string | null,
  verification: {
    status: string | null;
    message: string | null;
  }
): Promise<SettlementReconciliationResult | null> {
  const transferStatus =
    String(verification.status ?? "")
      .trim()
      .toLowerCase();

  if (!transferStatus) {
    return null;
  }

  const { data, error } =
    await supabaseServer.rpc(
      "reconcile_order_financial_settlement",
      {
        p_order_id: orderId,
        p_business_id: businessId,
        p_transfer_reference: transferReference,
        p_transfer_code: transferCode,
        p_transfer_status: transferStatus,
        p_error_message:
          transferStatus === "failed" ||
          transferStatus === "reversed"
            ? verification.message ??
              `Paystack transfer status: ${transferStatus}.`
            : null,
      }
    );

  if (error) {
    console.error(
      "Reconcile order financial settlement RPC error:",
      error
    );
    return null;
  }

  return data as SettlementReconciliationResult | null;
}

async function verifyAndReconcileSettlement(
  orderId: string,
  businessId: string,
  transferReference: string,
  transferCode: string | null,
  expectedPayoutAmount: number,
  expectedRecipientCode: string,
  expectedCurrency: string
): Promise<{
  status: "settled" | "failed" | "processing" | "unknown";
  result: SettlementReconciliationResult | null;
}> {
  try {
    const verification =
      await verifyPaystackTransfer(
        transferReference
      );

    const expectedAmount =
      Math.round(expectedPayoutAmount * 100);

    const verifiedAmount =
      verification.amount === null
        ? null
        : Math.round(verification.amount * 100);

    const verifiedCurrency =
      String(
        verification.currency ?? ""
      ).trim().toUpperCase();

    const expectedCurrencyNormalized =
      String(
        expectedCurrency ?? ""
      ).trim().toUpperCase();

    const verifiedRecipientCode =
      String(
        verification.recipientCode ?? ""
      ).trim();

    if (
      verifiedAmount === null ||
      verifiedAmount !== expectedAmount ||
      !verifiedCurrency ||
      !expectedCurrencyNormalized ||
      verifiedCurrency !== expectedCurrencyNormalized ||
      !verifiedRecipientCode ||
      verifiedRecipientCode !== expectedRecipientCode
    ) {
      console.error(
        "Paystack transfer integrity validation failed:",
        {
          transferReference,
          expectedAmount: expectedPayoutAmount,
          verifiedAmount: verification.amount,
          expectedCurrency: expectedCurrencyNormalized,
          verifiedCurrency,
          recipientMatches:
            verifiedRecipientCode ===
            expectedRecipientCode,
        }
      );

      return {
        status: "unknown",
        result: null,
      };
    }

    const reconciliation =
      await reconcileSettlement(
        orderId,
        businessId,
        transferReference,
        transferCode ??
          verification.transferCode,
        {
          status: verification.status,
          message: verification.message,
        }
      );

    const transferStatus =
      String(verification.status ?? "")
        .trim()
        .toLowerCase();

    if (
      reconciliation?.settlement_status ===
        "settled" ||
      transferStatus === "success"
    ) {
      return {
        status: "settled",
        result: reconciliation,
      };
    }

    if (
      reconciliation?.settlement_status ===
        "failed" ||
      transferStatus === "failed" ||
      transferStatus === "reversed"
    ) {
      return {
        status: "failed",
        result: reconciliation,
      };
    }

    if (
      reconciliation?.settlement_status ===
        "processing" ||
      transferStatus
    ) {
      return {
        status: "processing",
        result: reconciliation,
      };
    }

    return {
      status: "unknown",
      result: reconciliation,
    };
  } catch (error) {
    console.error(
      "Paystack settlement reconciliation error:",
      error
    );

    return {
      status: "unknown",
      result: null,
    };
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { orderId } = await params;

    const body = await request.json();
    const pin =
      typeof body.pin === "string"
        ? body.pin.trim()
        : "";

    if (!/^\d{6}$/.test(pin)) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter the 6-digit delivery PIN.",
        },
        { status: 400 }
      );
    }

    const supabaseAuth =
      await createSupabaseServerAuthClient();

    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const { data: deliveryData, error: deliveryError } =
      await supabaseAuth.rpc(
        "verify_order_delivery_pin",
        {
          p_order_id: orderId,
          p_pin: pin,
          p_verified_by: user.id,
        }
      );

    if (deliveryError) {
      console.error(
        "Verify delivery PIN RPC error:",
        deliveryError
      );

      return NextResponse.json(
        {
          success: false,
          message: "Failed to verify delivery PIN.",
        },
        { status: 500 }
      );
    }

    const deliveryResult = deliveryData as {
      success?: boolean;
      message?: string;
      attempts_remaining?: number;
      business_id?: string;
      order_id?: string;
    } | null;

    if (!deliveryResult?.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            deliveryResult?.message ??
            "Delivery PIN verification failed.",
          attempts_remaining:
            deliveryResult?.attempts_remaining,
        },
        { status: 400 }
      );
    }

    /*
     * The delivery PIN has now been successfully verified and
     * committed. Notify the buyer before continuing into the
     * merchant settlement flow.
     *
     * Notification failure must never undo the confirmed delivery.
     */
    let buyerNotificationSent = true;

    const { data: deliveredOrder, error: deliveredOrderError } =
      await supabaseServer
        .from("orders")
        .select(`
          id,
          buyer_id,
          business_id,
          businesses!inner(name)
        `)
        .eq("id", orderId)
        .single();

    if (
      deliveredOrderError ||
      !deliveredOrder
    ) {
      buyerNotificationSent = false;

      console.error(
        "Could not load delivered order for buyer notification:",
        deliveredOrderError
      );
    } else {
      const deliveredBusiness = Array.isArray(
        deliveredOrder.businesses
      )
        ? deliveredOrder.businesses[0]
        : deliveredOrder.businesses;

      if (
        deliveredOrder.buyer_id &&
        deliveredBusiness?.name
      ) {
        try {
          await createBuyerNotification({
            buyerId: deliveredOrder.buyer_id,
            businessId: deliveredOrder.business_id,
            orderId: deliveredOrder.id,
            title: "Order delivered",
            message: `Your order from ${deliveredBusiness.name} has been delivered.`,
            type: BuyerNotificationType.ORDER_DELIVERED,
            link: `/buyer/orders/${deliveredOrder.id}`,
          });
        } catch (notificationError) {
          /*
           * The unique (order_id, type) constraint makes this
           * notification idempotent. If it already exists,
           * consider the notification successfully recorded.
           */
          if (
            notificationError &&
            typeof notificationError === "object" &&
            "code" in notificationError &&
            notificationError.code === "23505"
          ) {
            buyerNotificationSent = true;
          } else {
            buyerNotificationSent = false;

            console.error(
              "Buyer delivery notification failed:",
              notificationError
            );
          }
        }
      } else {
        buyerNotificationSent = false;

        console.error(
          "Buyer delivery notification could not be sent: missing buyer or business information."
        );
      }
    }

    const businessId =
      String(
        deliveryResult.business_id ?? ""
      ).trim();

    if (!businessId) {
      console.error(
        "Delivery verification returned no business ID:",
        { orderId }
      );

      return NextResponse.json(
        {
          success: true,
          message:
            "Delivery confirmed, but settlement could not be started automatically.",
          settlement_status: "pending",
          notificationSent: buyerNotificationSent,
        },
        { status: 200 }
      );
    }

    /*
     * Claim settlement atomically before making the Paystack
     * transfer. This changes the ledger from pending → processing
     * and gives us the exact payout amount, recipient and
     * deterministic transfer reference.
     */
    const { data: claimData, error: claimError } =
      await supabaseAuth.rpc(
        "claim_order_settlement",
        {
          p_order_id: orderId,
          p_business_id: businessId,
        }
      );

    if (claimError) {
      console.error(
        "Claim order settlement RPC error:",
        claimError
      );

      return NextResponse.json(
        {
          success: true,
          message:
            "Delivery confirmed, but settlement could not be started automatically.",
          settlement_status: "pending",
          notificationSent: buyerNotificationSent,
        },
        { status: 200 }
      );
    }

    const claimResult = claimData as {
      success?: boolean;
      message?: string;
      already_settled?: boolean;
      already_processing?: boolean;
      settlement_status?: string;
      order_id?: string;
      business_id?: string;
      transfer_reference?: string;
      transfer_recipient_code?: string;
      payout_amount?: number;
    } | null;

    if (!claimResult?.success) {
      return NextResponse.json({
        success: true,
        message:
          "Delivery confirmed. Settlement was not started.",
        settlement_status: "pending",
        notificationSent: buyerNotificationSent,
        settlement_message:
          claimResult?.message ??
          "Settlement could not be started.",
      });
    }

    if (claimResult.already_settled) {
      return NextResponse.json({
        success: true,
        message:
          deliveryResult.message ??
          "Delivery confirmed and merchant settlement was already completed.",
        settlement_status: "settled",
        notificationSent: buyerNotificationSent,
      });
    }

    if (claimResult.already_processing) {
      const existingTransferReference =
        String(
          claimResult.transfer_reference ?? ""
        ).trim();

      const existingPayoutAmount =
        Number(claimResult.payout_amount);

      const existingRecipientCode =
        String(
          claimResult.transfer_recipient_code ?? ""
        ).trim();

      /*
       * The ledger is already processing. Do not start another
       * transfer. Reconcile the deterministic reference instead.
       */

      if (
        !existingTransferReference ||
        !Number.isFinite(existingPayoutAmount) ||
        existingPayoutAmount <= 0 ||
        !existingRecipientCode
      ) {
        return NextResponse.json({
          success: true,
          message:
            "Delivery confirmed. Settlement is being processed, but the transfer reference is not yet available for reconciliation.",
          settlement_status: "processing",
          notificationSent: buyerNotificationSent,
        });
      }

      const { data: existingBusinessData } =
        await supabaseServer
          .from("businesses")
          .select("currency")
          .eq("id", businessId)
          .maybeSingle();

      const existingCurrency =
        String(
          existingBusinessData?.currency ?? ""
        ).trim();

      if (!existingCurrency) {
        return NextResponse.json({
          success: true,
          message:
            "Delivery confirmed and merchant settlement is still being processed.",
          settlement_status: "processing",
          notificationSent: buyerNotificationSent,
        });
      }

      const reconciliation =
        await verifyAndReconcileSettlement(
          orderId,
          businessId,
          existingTransferReference,
          null,
          existingPayoutAmount,
          existingRecipientCode,
          existingCurrency
        );

      if (reconciliation.status === "settled") {
        return NextResponse.json({
          success: true,
          message:
            "Delivery confirmed and merchant settlement completed successfully.",
          settlement_status: "settled",
          notificationSent: buyerNotificationSent,
        });
      }

      if (reconciliation.status === "failed") {
        return NextResponse.json({
          success: true,
          message:
            "Delivery confirmed, but the merchant settlement failed.",
          settlement_status: "failed",
          notificationSent: buyerNotificationSent,
        });
      }

      /*
       * Keep processing. The same deterministic reference can be
       * reconciled again by a retry or webhook without creating a
       * second payout.
       */
      return NextResponse.json({
        success: true,
        message:
          "Delivery confirmed and merchant settlement is still being processed.",
        settlement_status: "processing",
        notificationSent: buyerNotificationSent,
      });
    }

    const transferReference =
      String(
        claimResult.transfer_reference ?? ""
      ).trim();

    const transferRecipientCode =
      String(
        claimResult.transfer_recipient_code ?? ""
      ).trim();

    const payoutAmount =
      Number(claimResult.payout_amount);

    if (
      !transferReference ||
      !transferRecipientCode ||
      !Number.isFinite(payoutAmount) ||
      payoutAmount <= 0
    ) {
      console.error(
        "Invalid settlement claim payload:",
        {
          orderId,
          hasTransferReference: Boolean(
            transferReference
          ),
          hasRecipientCode: Boolean(
            transferRecipientCode
          ),
          payoutAmount,
        }
      );

      return NextResponse.json(
        {
          success: true,
          message:
            "Delivery confirmed, but settlement details are invalid.",
          settlement_status: "processing",
          notificationSent: buyerNotificationSent,
        },
        { status: 200 }
      );
    }

    const { data: businessData, error: businessError } =
      await supabaseServer
        .from("businesses")
        .select("currency")
        .eq("id", businessId)
        .maybeSingle();

    const expectedCurrency =
      String(
        businessData?.currency ?? ""
      ).trim();

    if (
      businessError ||
      !expectedCurrency
    ) {
      console.error(
        "Failed to load business currency for settlement validation:",
        businessError
      );

      return NextResponse.json(
        {
          success: true,
          message:
            "Delivery confirmed. Settlement is being processed.",
          settlement_status: "processing",
          notificationSent: buyerNotificationSent,
        },
        { status: 200 }
      );
    }

    let transferResult;

    try {
      transferResult =
        await initiatePaystackTransfer({
          amount: payoutAmount,
          recipientCode: transferRecipientCode,
          reference: transferReference,
          reason:
            "Vendora merchant settlement",
        });
    } catch (transferError) {
      console.error(
        "Paystack transfer initiation error:",
        transferError
      );

      /*
       * An initiation error does NOT prove that Paystack rejected
       * the transfer. A timeout/network failure can happen after
       * Paystack accepted it.
       *
       * Reconcile the same deterministic reference before deciding
       * whether the settlement actually failed.
       */
      const reconciliation =
        await verifyAndReconcileSettlement(
          orderId,
          businessId,
          transferReference,
          null,
          payoutAmount,
          transferRecipientCode,
          expectedCurrency
        );

      if (reconciliation.status === "settled") {
        return NextResponse.json({
          success: true,
          message:
            "Delivery confirmed and merchant settlement completed successfully.",
          settlement_status: "settled",
          notificationSent: buyerNotificationSent,
        });
      }

      if (reconciliation.status === "failed") {
        return NextResponse.json({
          success: true,
          message:
            "Delivery confirmed, but the merchant settlement failed.",
          settlement_status: "failed",
          notificationSent: buyerNotificationSent,
        });
      }

      return NextResponse.json({
        success: true,
        message:
          "Delivery confirmed. The merchant settlement is being processed and will be reconciled automatically.",
        settlement_status: "processing",
        notificationSent: buyerNotificationSent,
      });
    }

    /*
     * Paystack should return a transfer code for a successfully
     * accepted transfer request. Store it before attempting
     * status verification.
     */
    if (!transferResult.transferCode) {
      console.error(
        "Paystack transfer returned no transfer code:",
        { orderId, transferReference }
      );

      return NextResponse.json(
        {
          success: true,
          message:
            "Delivery confirmed. The merchant settlement is being processed.",
          settlement_status: "processing",
          notificationSent: buyerNotificationSent,
        },
        { status: 200 }
      );
    }

    const { error: recordError } =
      await supabaseAuth.rpc(
        "record_paystack_transfer",
        {
          p_order_id: orderId,
          p_business_id: businessId,
          p_transfer_reference:
            transferReference,
          p_transfer_code:
            transferResult.transferCode,
        }
      );

    if (recordError) {
      console.error(
        "Record Paystack transfer RPC error:",
        recordError
      );

      return NextResponse.json(
        {
          success: true,
          message:
            "Delivery confirmed and the Paystack transfer was initiated. Settlement is still being processed.",
          settlement_status: "processing",
          notificationSent: buyerNotificationSent,
        },
        { status: 200 }
      );
    }

    /*
     * Transfer initiation is not the same as final settlement.
     * Verify the transfer and only mark the ledger settled when
     * Paystack reports a conclusive success.
     */
    let verification;

    try {
      verification =
        await verifyPaystackTransfer(
          transferReference
        );
    } catch (verificationError) {
      console.error(
        "Paystack transfer verification error:",
        verificationError
      );

      return NextResponse.json(
        {
          success: true,
          message:
            "Delivery confirmed and the merchant settlement was initiated. Settlement is still being processed.",
          settlement_status: "processing",
          notificationSent: buyerNotificationSent,
        },
        { status: 200 }
      );
    }

    const transferStatus =
      String(
        verification.status ?? ""
      ).trim().toLowerCase();

    const expectedAmountInKobo =
      Math.round(payoutAmount * 100);

    const verifiedAmountInKobo =
      verification.amount === null
        ? null
        : Math.round(verification.amount * 100);

    const verifiedCurrency =
      String(
        verification.currency ?? ""
      ).trim().toUpperCase();

    const expectedCurrencyNormalized =
      expectedCurrency.toUpperCase();

    const verifiedRecipientCode =
      String(
        verification.recipientCode ?? ""
      ).trim();

    if (
      verifiedAmountInKobo === null ||
      verifiedAmountInKobo !== expectedAmountInKobo ||
      !verifiedCurrency ||
      verifiedCurrency !== expectedCurrencyNormalized ||
      !verifiedRecipientCode ||
      verifiedRecipientCode !== transferRecipientCode
    ) {
      console.error(
        "Paystack transfer integrity validation failed:",
        {
          transferReference,
          expectedAmount: payoutAmount,
          verifiedAmount: verification.amount,
          expectedCurrency: expectedCurrencyNormalized,
          verifiedCurrency,
          recipientMatches:
            verifiedRecipientCode ===
            transferRecipientCode,
        }
      );

      return NextResponse.json({
        success: true,
        message:
          "Delivery confirmed. The merchant settlement is being processed.",
        settlement_status: "processing",
        notificationSent: buyerNotificationSent,
      });
    }

    const reconciliation =
      await reconcileSettlement(
        orderId,
        businessId,
        transferReference,
        transferResult.transferCode,
        {
          status: verification.status,
          message: verification.message,
        }
      );

    if (
      reconciliation?.success &&
      reconciliation.settlement_status ===
        "settled"
    ) {
      return NextResponse.json({
        success: true,
        message:
          "Delivery confirmed and merchant settlement completed successfully.",
        settlement_status: "settled",
        notificationSent: buyerNotificationSent,
      });
    }

    if (
      reconciliation?.success &&
      reconciliation.settlement_status ===
        "failed"
    ) {
      return NextResponse.json({
        success: true,
        message:
          "Delivery confirmed, but the merchant settlement failed.",
        settlement_status: "failed",
        notificationSent: buyerNotificationSent,
      });
    }

    if (
      transferStatus === "success" &&
      !reconciliation
    ) {
      console.error(
        "Paystack transfer succeeded but settlement reconciliation could not be recorded."
      );
    }

    if (
      (transferStatus === "failed" ||
        transferStatus === "reversed") &&
      !reconciliation
    ) {
      console.error(
        "Paystack transfer reached a failed/reversed status but settlement reconciliation could not be recorded."
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Delivery confirmed and merchant settlement is being processed.",
      settlement_status: "processing",
      notificationSent: buyerNotificationSent,
    });
  } catch (error) {
    console.error(
      "Verify delivery PIN error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to verify delivery PIN.",
      },
      { status: 500 }
    );
  }
}
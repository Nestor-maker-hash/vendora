"use client";

import { Suspense, useEffect, useState } from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

type PaymentState =
  | "processing"
  | "success"
  | "error";

function SubscriptionPaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [paymentState, setPaymentState] =
    useState<PaymentState>("processing");

  const [message, setMessage] =
    useState(
      "Verifying your payment securely..."
    );

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function verifyPayment() {
      const transactionId =
        searchParams.get("transaction_id");

      const transactionReference =
        searchParams.get("tx_ref");

      const status =
        String(
          searchParams.get("status") ?? ""
        )
          .trim()
          .toLowerCase();

      if (!transactionId || !transactionReference) {
        if (!cancelled) {
          setPaymentState("error");
          setMessage(
            "We could not identify this payment."
          );
          setErrorMessage(
            "Flutterwave did not return the payment information required to verify your subscription."
          );
        }

        return;
      }

      if (
        status &&
        status !== "successful"
      ) {
        if (!cancelled) {
          setPaymentState("error");
          setMessage(
            "Payment was not completed."
          );
          setErrorMessage(
            "Your subscription has not been changed. You can return and try the payment again."
          );
        }

        return;
      }

      try {
        setMessage(
          "Checking your payment with Flutterwave..."
        );

        const response = await fetch(
          "/api/subscriptions/verify-payment",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              transaction_id:
                transactionId,
              tx_ref:
                transactionReference,
            }),
          }
        );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ??
              "Payment verification failed."
          );
        }

        if (cancelled) {
          return;
        }

        setPaymentState("success");

        setMessage(
          result.alreadyProcessed
            ? "Your subscription is already active."
            : "Payment verified! Your subscription has been activated."
        );

        window.setTimeout(() => {
          if (!cancelled) {
            router.replace(
              "/subscription"
            );
          }
        }, 1800);
      } catch (error) {
        console.error(
          "Subscription payment verification:",
          error
        );

        if (!cancelled) {
          const message =
            error instanceof Error
              ? error.message
              : "We could not verify your payment.";

          setPaymentState("error");
          setMessage(
            "Payment verification failed."
          );
          setErrorMessage(message);
        }
      }
    }

    verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [
    router,
    searchParams,
  ]);

  const isProcessing =
    paymentState === "processing";

  const isSuccess =
    paymentState === "success";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="px-6 py-8 text-center sm:px-8 sm:py-10">

          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-2xl ${
              isProcessing
                ? "bg-emerald-50"
                : isSuccess
                  ? "bg-emerald-100"
                  : "bg-red-50"
            }`}
          >
            {isProcessing ? (
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
            ) : isSuccess ? (
              "✓"
            ) : (
              "!"
            )}
          </div>

          <p
            className={`mt-6 text-[10px] font-bold uppercase tracking-[0.18em] ${
              isProcessing
                ? "text-emerald-600"
                : isSuccess
                  ? "text-emerald-600"
                  : "text-red-500"
            }`}
          >
            {isProcessing
              ? "Secure verification"
              : isSuccess
                ? "Payment complete"
                : "Verification failed"}
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {isProcessing
              ? "Processing your payment"
              : isSuccess
                ? "Subscription activated!"
                : "We couldn't verify your payment"}
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {message}
          </p>

          {isProcessing && (
            <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                  🔒
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Secure payment verification
                  </p>

                  <p className="mt-0.5 text-xs leading-5 text-slate-500">
                    We're securely confirming your payment
                    before activating your subscription.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isSuccess && (
            <div className="mt-7 rounded-2xl bg-emerald-50 px-4 py-4">
              <p className="text-sm font-semibold text-emerald-800">
                Your Vendora plan is now active.
              </p>

              <p className="mt-1 text-xs leading-5 text-emerald-700">
                Taking you back to your subscription settings...
              </p>
            </div>
          )}

          {paymentState === "error" && (
            <>
              {errorMessage && (
                <div className="mt-7 rounded-2xl bg-red-50 px-4 py-4 text-left">
                  <p className="text-xs leading-5 text-red-700">
                    {errorMessage}
                  </p>
                </div>
              )}

              <div className="mt-7 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() =>
                    router.replace(
                      "/subscription"
                    )
                  }
                  className="w-full rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  Back to Subscription
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.replace(
                      "/dashboard"
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Return to Dashboard
                </button>
              </div>
            </>
          )}

          <p className="mt-6 text-[11px] leading-5 text-slate-400">
            Your subscription is only activated after
            Vendora securely verifies the completed
            payment with Flutterwave.
          </p>

        </div>
      </div>
    </main>
  );
}

export default function SubscriptionPaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
          <div className="text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />

            <p className="text-sm font-medium text-slate-500">
              Preparing payment verification...
            </p>
          </div>
        </main>
      }
    >
      <SubscriptionPaymentCallbackContent />
    </Suspense>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

export default function SubscriptionPaymentCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [message, setMessage] =
    useState("Verifying your payment...");

  const [failed, setFailed] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    async function verifyPayment() {
      const transactionId =
        searchParams.get("transaction_id");

      const transactionReference =
        searchParams.get("tx_ref");

      if (
        !transactionId ||
        !transactionReference
      ) {
        if (!cancelled) {
          setFailed(true);
          setMessage(
            "We could not identify your payment."
          );
        }

        return;
      }

      try {
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

        if (!cancelled) {
          setMessage(
            "Payment confirmed! Your subscription has been activated."
          );

          window.setTimeout(() => {
            router.replace(
              "/subscription?payment=success"
            );
          }, 1200);
        }
      } catch (error) {
        console.error(
          "Subscription payment verification:",
          error
        );

        if (!cancelled) {
          setFailed(true);
          setMessage(
            error instanceof Error
              ? error.message
              : "We could not verify your payment."
          );
        }
      }
    }

    verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
        {!failed ? (
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl">
            ✓
          </div>
        ) : (
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">
            !
          </div>
        )}

        <h1 className="text-2xl font-bold">
          {failed
            ? "Payment Verification"
            : "Processing Payment"}
        </h1>

        <p className="mt-3 text-gray-500">
          {message}
        </p>

        {failed && (
          <button
            onClick={() =>
              router.replace("/subscription")
            }
            className="mt-6 rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700"
          >
            Return to Subscription
          </button>
        )}
      </div>
    </main>
  );
}

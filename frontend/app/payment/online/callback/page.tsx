
"use client";

import { Suspense, useEffect, useState } from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

function OnlinePaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [message, setMessage] =
    useState("Verifying your payment...");

  const [failed, setFailed] =
    useState(false);

  const [retryToken, setRetryToken] =
    useState<string | null>(null);

  const [storeSlug, setStoreSlug] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function verifyPayment() {
      const reference =
        searchParams.get("reference");

      if (!reference) {
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
          "/api/orders/verify-online-payment",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              reference,
            }),
          }
        );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          if (
            typeof result.publicToken === "string"
          ) {
            setRetryToken(
              result.publicToken
            );
          }

          if (
            typeof result.storeSlug === "string"
          ) {
            setStoreSlug(
              result.storeSlug
            );
          }

          throw new Error(
            result.message ??
              "Payment verification failed."
          );
        }

        if (!cancelled) {
          setMessage(
            result.alreadyPaid
              ? "Your payment was already confirmed."
              : "Payment confirmed successfully!"
          );

          window.setTimeout(() => {
            const orderId =
              typeof result.orderId === "string"
                ? result.orderId
                : null;

            const params = new URLSearchParams();

            if (orderId) {
              params.set("order", orderId);
            }

            const publicToken =
              typeof result.publicToken === "string"
                ? result.publicToken
                : null;

            if (publicToken) {
              params.set("token", publicToken);
            }

            router.replace(
              params.toString()
                ? `/order-success?${params.toString()}`
                : "/order-success"
            );
          }, 1500);
        }
      } catch (error) {
        console.error(
          "Online payment verification:",
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
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:py-10">
      <div className="mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${
                failed
                  ? "bg-red-50"
                  : "bg-emerald-50"
              }`}
            >
              {failed ? "!" : "💳"}
            </div>

            <div>
              <p
                className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${
                  failed
                    ? "text-red-600"
                    : "text-emerald-600"
                }`}
              >
                {failed
                  ? "Payment issue"
                  : "Secure payment"}
              </p>

              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                {failed
                  ? "Payment Verification"
                  : "Processing Payment"}
              </h1>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">

          {!failed ? (
            <div className="flex flex-col items-center py-5 text-center">

              <div className="relative flex h-20 w-20 items-center justify-center">
                <div className="absolute inset-0 animate-ping rounded-full bg-emerald-100 opacity-60" />

                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
                </div>
              </div>

              <h2 className="mt-6 text-lg font-bold text-slate-900">
                Verifying your payment
              </h2>

              <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                {message}
              </p>

              <div className="mt-6 w-full rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs leading-5 text-slate-500">
                  Please wait while we securely confirm your payment.
                  Do not close this page.
                </p>
              </div>

            </div>
          ) : (
            <div className="py-3">

              <div className="flex flex-col items-center text-center">

                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-2xl font-bold text-red-500">
                  !
                </div>

                <h2 className="mt-5 text-lg font-bold text-slate-900">
                  We couldn't verify your payment
                </h2>

                <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                  {message}
                </p>

              </div>

              <div className="mt-7 space-y-3">

                {retryToken && (
                  <button
                    type="button"
                    onClick={() =>
                      router.replace(
                        `/payment/online?token=${encodeURIComponent(
                          retryToken
                        )}&retry=true`
                      )
                    }
                    className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md"
                  >
                    Try Payment Again
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    router.replace(
                      storeSlug
                        ? `/store/${encodeURIComponent(
                            storeSlug
                          )}`
                        : "/"
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Continue Shopping
                </button>

              </div>

            </div>
          )}

        </div>
      </div>
    </main>
  );
}

export default function OnlinePaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50 px-4 py-6 sm:py-10">
          <div className="mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-lg">
                  💳
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-600">
                    Secure payment
                  </p>

                  <h1 className="text-xl font-bold tracking-tight text-slate-900">
                    Processing Payment
                  </h1>
                </div>

              </div>
            </div>

            <div className="flex flex-col items-center px-5 py-14 text-center sm:px-6">

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
              </div>

              <h2 className="mt-6 text-lg font-bold text-slate-900">
                Verifying your payment
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Please wait a moment...
              </p>

            </div>

          </div>
        </main>
      }
    >
      <OnlinePaymentCallbackContent />
    </Suspense>
  );
}

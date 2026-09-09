"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

function OnlinePaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [message, setMessage] =
    useState("Preparing your secure payment...");

  const [failed, setFailed] =
    useState(false);

  const initializationStarted =
    useRef<string | null>(null);

  const token =
    searchParams.get("token");

  const retry =
    searchParams.get("retry") === "true";

  useEffect(() => {
    let cancelled = false;

    if (!token) {
      setFailed(true);
      setMessage(
        "We could not identify this order."
      );

      return;
    }

    const initializationKey =
      `${token}:${retry ? "retry" : "normal"}`;

    if (
      initializationStarted.current ===
      initializationKey
    ) {
      return;
    }

    initializationStarted.current =
      initializationKey;

    async function initializePayment() {
      try {
        const response = await fetch(
          `/api/orders/public/${token}/initialize-online-payment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              retry,
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
              "Failed to prepare payment."
          );
        }

        if (
          !result.authorizationUrl ||
          typeof result.authorizationUrl !==
            "string"
        ) {
          throw new Error(
            "Payment provider did not return a payment link."
          );
        }

        if (!cancelled) {
          setMessage(
            "Redirecting you to our secure payment partner..."
          );

          window.location.href =
            result.authorizationUrl;
        }
      } catch (error) {
        console.error(
          "Initialize online payment:",
          error
        );

        if (!cancelled) {
          setFailed(true);

          setMessage(
            error instanceof Error
              ? error.message
              : "Failed to prepare payment."
          );
        }
      }
    }

    initializePayment();

    return () => {
      cancelled = true;
    };
  }, [router, token, retry]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:py-10">
      <div className="mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-lg">
              🔒
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-600">
                Secure Payment
              </p>

              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                {failed
                  ? "Payment Problem"
                  : "Preparing Payment"}
              </h1>
            </div>
          </div>

          <p className="mt-3 text-sm leading-5 text-slate-500">
            {failed
              ? "We couldn't prepare your payment."
              : "You're being securely redirected to complete your payment."}
          </p>
        </div>

        <div className="p-5 sm:p-6">

          {!failed ? (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
              </div>

              <p className="mt-3 text-sm font-semibold text-slate-900">
                Securing your payment session
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                {message}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl shadow-sm">
                !
              </div>

              <p className="mt-3 text-sm font-semibold text-slate-900">
                Unable to continue
              </p>

              <p className="mt-1 text-xs leading-5 text-red-600">
                {message}
              </p>
            </div>
          )}

          {!failed && (
            <div className="mt-5 rounded-xl bg-slate-50 px-3.5 py-3">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 text-xs">🔒</span>

                <p className="text-xs leading-5 text-slate-500">
                  Your payment details are handled securely by our payment provider.
                  Vendora does not process or store your card details.
                </p>
              </div>
            </div>
          )}

          {failed && (
            <button
              type="button"
              onClick={() => router.back()}
              className="mt-5 w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md"
            >
              Go Back
            </button>
          )}

        </div>
      </div>
    </main>
  );
}

export default function OnlinePaymentPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50 px-4 py-6 sm:py-10">
          <div className="mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-lg">
                  🔒
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-600">
                    Secure Payment
                  </p>

                  <h1 className="text-xl font-bold tracking-tight text-slate-900">
                    Preparing Payment
                  </h1>
                </div>
              </div>

              <p className="mt-3 text-sm leading-5 text-slate-500">
                Loading your secure payment session...
              </p>
            </div>

            <div className="p-5 sm:p-6">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
                </div>

                <p className="mt-3 text-sm font-semibold text-slate-900">
                  Securing your payment session
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Please wait...
                </p>
              </div>
            </div>

          </div>
        </main>
      }
    >
      <OnlinePaymentContent />
    </Suspense>
  );
}
